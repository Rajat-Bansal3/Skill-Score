export interface JoinTournamentMessage {
  type: "join_tournament";
  tournamentId: string;
  userId: string;
}

export interface LeaveTournamentMessage {
  type: "leave_tournament";
  tournamentId: string;
  userId: string;
}

export interface SendMessageMessage {
  type: "send_message";
  tournamentId: string;
  message: string;
  userId: string;
}
export type ClientMessage =
  | JoinTournamentMessage
  | LeaveTournamentMessage
  | SendMessageMessage;
