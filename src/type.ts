import { NextRequest } from "next/server";

export type NextRequestWithUser = NextRequest & { user?: any };
