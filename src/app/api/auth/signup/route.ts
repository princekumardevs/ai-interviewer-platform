import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, target_role, experience_level } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Email, password, and full name are required' } },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: { code: 'SIGNUP_FAILED', message: error.message } },
        { status: 400 }
      );
    }

    // Update profile with additional fields (the trigger creates the profile row)
    if (data.user) {
      const updates: { full_name: string; target_role: string; experience_level: string } = {
        full_name,
        target_role: target_role || 'Software Engineer',
        experience_level: experience_level || 'mid',
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
