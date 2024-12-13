import { Request, Response, NextFunction, Router } from "express";
import { validateQuery } from "../utils/validateRequest";
import {
  fetchPlayerGamesRequest,
  fetchPlayerStatsRequest,
  Game,
} from "../types/types";
import { SuccessHandler } from "../utils/responseHandler";
import { scoreFEN } from "../utils/scrore";
import { timeToSeconds } from "../utils/hhmmss_to_ms";
export const playerRouter = Router();

playerRouter.get(
  "/stats",
  validateQuery(fetchPlayerStatsRequest, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.query;
    try {
      const payload = await fetch(
        `${process.env.CHESS_API_URL}/player/${username}/stats`
      );
      const data = await payload.json();
      return SuccessHandler(res, "Fetched Successfully", data);
    } catch (error) {
      next(error);
    }
  }
);
playerRouter.get(
  "/games",
  validateQuery(fetchPlayerGamesRequest, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    let { month, year, username, mode } = req.query;
    try {
      const payload = await fetch(
        `${process.env.CHESS_API_URL}/player/${username}/games/${year}/${month}`
      );
      const data = (await payload.json()) as { games: Game[] };

      const uuids = new Set();
      const ops = new Set();

      const Scores = data.games
        .filter((game: Game) => {
          const curr = game.black.username === username;
          return (
            !uuids.has(game.uuid) &&
            game.time_class === mode &&
            game.rated === true &&
            !(curr ? ops.has(game.white.uuid) : ops.has(game.black.uuid))
          );
        })
        .map((game: Game) => {
          const currPlayer =
            game.black.username === username ? game.black : game.white;
          const opponent =
            game.black.username === username ? game.white : game.black;

          let score = 0;

          switch (true) {
            case currPlayer.rating - opponent.rating <= -200:
              score -= 7;
              break;
            case currPlayer.rating - opponent.rating <= -150:
              score -= 5;
              break;
            case currPlayer.rating - opponent.rating <= -100:
              score -= 3;
              break;
            case currPlayer.rating - opponent.rating <= -50:
              score -= 1;
              break;
            case currPlayer.rating - opponent.rating <= 50:
              score += 0;
              break;
            case currPlayer.rating - opponent.rating <= 100:
              score += 3;
              break;
            case currPlayer.rating - opponent.rating <= 150:
              score += 5;
              break;
            case currPlayer.rating - opponent.rating <= 200:
              score += 7;
              break;
            default:
              score += 9;
              break;
          }

          const { white, black } = scoreFEN(game.fen);
          score += currPlayer === game.black ? 39 - white : 39 - black;
          if (
            (currPlayer === game.black &&
              currPlayer.result === "win" &&
              opponent.result === "checkmated") ||
            (currPlayer === game.white &&
              currPlayer.result === "win" &&
              opponent.result === "checkmated")
          ) {
            score += 50;
          } else if (
            (currPlayer === game.black &&
              currPlayer.result === "win" &&
              opponent.result === "timeout") ||
            (currPlayer === game.white &&
              currPlayer.result === "win" &&
              opponent.result === "timeout")
          ) {
            score += 15;
          } else if (
            (currPlayer === game.black &&
              currPlayer.result === "win" &&
              opponent.result === "resigned") ||
            (currPlayer === game.white &&
              currPlayer.result === "win" &&
              opponent.result === "resigned")
          ) {
            score += 30;
          }

          ops.add(opponent.uuid);
          uuids.add(game.uuid);
          return score;
        });

      const sum = Scores.reduce((acc, score) => acc + score, 0);

      return SuccessHandler(res, `Scoring done for user : ${username}`, sum);
    } catch (error) {
      next(error);
    }
  }
);
