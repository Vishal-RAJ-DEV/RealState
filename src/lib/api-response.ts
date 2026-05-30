import { NextResponse } from "next/server";

export const apiSuccess = (data: any, status = 200) =>
  NextResponse.json(data, { status });

export const apiError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

export const apiUnauthorized = () =>
  NextResponse.json({ error: "Authentication required" }, { status: 401 });

export const apiForbidden = () =>
  NextResponse.json({ error: "Not authorized" }, { status: 403 });

export const apiNotFound = (resource = "Resource") =>
  NextResponse.json({ error: `${resource} not found` }, { status: 404 });