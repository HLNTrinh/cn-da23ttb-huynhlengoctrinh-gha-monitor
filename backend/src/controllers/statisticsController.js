import { getStatistics } from '../services/statisticsService.js';
import { asyncHandler, sendSuccess } from '../utils/response.js';

export const getOverview = asyncHandler(async (req, res) => sendSuccess(res, await getStatistics()));
