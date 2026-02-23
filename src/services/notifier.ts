// Notifier Service
// Lark webhook notification for winners

import type { Env, Prize } from '../types/entities';
import { logger } from '../utils/logger';
import { getPrizeDisplayName } from './matcher';

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000; // 1 second

interface LarkCardMessage {
  msg_type: 'interactive';
  card: {
    header: {
      title: { tag: 'plain_text'; content: string };
      template: string;
    };
    elements: Array<{
      tag: 'div';
      text: { tag: 'lark_md'; content: string };
    }>;
  };
}

/**
 * Format a single win notification card
 */
function formatWinCard(
  participantName: string,
  ticketNumbers: [string, string],
  prize: Prize,
  drawDate: string
): LarkCardMessage {
  const formattedDate = new Date(drawDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: 'CHÚC MỪNG TRÚNG GIẢI!' },
        template: 'green',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Người trúng giải:**\n${participantName}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Vé số:**\n${ticketNumbers[0]} - ${ticketNumbers[1]}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Giải thưởng:**\n${getPrizeDisplayName(prize)}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Ngày quay:**\n${formattedDate}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '_Hệ thống Theo Dõi Xổ Số Max 3D+_',
          },
        },
      ],
    },
  };
}

/**
 * Format a batch notification card
 */
function formatBatchCard(
  winners: Array<{ participantName: string; ticketNumbers: [string, string]; prize: Prize }>,
  drawDate: string
): LarkCardMessage {
  const formattedDate = new Date(drawDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const winnerList = winners
    .map(
      (w) =>
        `- **${w.participantName}**: ${w.ticketNumbers[0]}-${w.ticketNumbers[1]} (${getPrizeDisplayName(w.prize)})`
    )
    .join('\n');

  return {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: `TỔNG KẾT NGÀY ${formattedDate}` },
        template: 'blue',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Số người trúng giải:** ${winners.length}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Chi tiết:**\n${winnerList}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '_Hệ thống Theo Dõi Xổ Số Max 3D+_',
          },
        },
      ],
    },
  };
}

/**
 * Send notification to Lark webhook with retry logic
 */
async function sendWebhook(
  webhookUrl: string,
  message: LarkCardMessage,
  retries: number = MAX_RETRIES
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const result = await response.json() as { StatusCode?: number };
        if (result.StatusCode === 0) {
          return true;
        }
        logger.warn('Webhook returned non-zero status', { result });
      } else {
        logger.warn('Webhook request failed', { status: response.status });
      }
    } catch (error) {
      logger.error('Webhook error', error, { attempt });
    }

    // Exponential backoff
    if (attempt < retries) {
      await sleep(RETRY_BASE_DELAY * Math.pow(2, attempt - 1));
    }
  }

  return false;
}

/**
 * Send a single win notification
 */
export async function sendWinNotification(
  env: Env,
  participantName: string,
  ticketNumbers: [string, string],
  prize: Prize,
  drawDate: string
): Promise<boolean> {
  if (!env.LARK_WEBHOOK_URL) {
    logger.warn('Lark webhook URL not configured');
    return false;
  }

  const message = formatWinCard(participantName, ticketNumbers, prize, drawDate);
  const success = await sendWebhook(env.LARK_WEBHOOK_URL, message);

  if (success) {
    logger.info('Win notification sent successfully', { participantName, prize });
  } else {
    logger.error('Failed to send win notification', null, { participantName, prize });
  }

  return success;
}

/**
 * Send batch win notifications
 * First sends individual notifications, then a summary
 */
export async function sendBatchWinNotifications(
  env: Env,
  winners: Array<{ participantName: string; ticketNumbers: [string, string]; prize: Prize }>,
  drawDate: string
): Promise<void> {
  if (!env.LARK_WEBHOOK_URL) {
    logger.warn('Lark webhook URL not configured');
    return;
  }

  logger.info('Sending batch win notifications', { winnerCount: winners.length });

  // Send individual notifications
  for (const winner of winners) {
    await sendWinNotification(
      env,
      winner.participantName,
      winner.ticketNumbers,
      winner.prize,
      drawDate
    );
    // Small delay between messages to avoid rate limiting
    await sleep(100);
  }

  // Send batch summary
  if (winners.length > 1) {
    const summaryMessage = formatBatchCard(winners, drawDate);
    const success = await sendWebhook(env.LARK_WEBHOOK_URL, summaryMessage);
    if (success) {
      logger.info('Batch summary sent successfully');
    }
  }
}

/**
 * Send fetch complete notification
 */
export async function sendFetchCompleteNotification(
  env: Env,
  fetchedCount: number,
  winnerCount: number
): Promise<void> {
  if (!env.LARK_WEBHOOK_URL) return;

  const now = new Date();
  const formattedTime = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

  const message: LarkCardMessage = {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: 'HOÀN THÀNH LẤY KẾT QUẢ' },
        template: 'green',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Thời gian:** ${formattedTime} - ${formattedDate}`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Số lượng:** ${fetchedCount}/20 bộ số`,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Số người trúng giải:** ${winnerCount}`,
          },
        },
      ],
    },
  };

  await sendWebhook(env.LARK_WEBHOOK_URL, message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
