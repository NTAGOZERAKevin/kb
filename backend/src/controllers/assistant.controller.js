import { askAssistant, sanitizeMessages } from '../services/assistant.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const messages = sanitizeMessages(req.body?.messages);
  const { reply } = await askAssistant(messages);

  res.json({
    success: true,
    data: { reply },
  });
});
