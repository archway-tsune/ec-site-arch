/**
 * ログアウトAPI
 */
import { NextResponse } from 'next/server';
import { destroyServerSession } from '@/infrastructure/auth';
import { success } from '@/foundation/errors/response';

export async function POST() {
  await destroyServerSession();
  return NextResponse.json(success({ message: 'ログアウトしました' }));
}
