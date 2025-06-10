import { NextResponse } from "next/server";
import { supabase } from "@/app/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("surveys")
    .select(
      `
      id,
      user_info,
      created_at,
      survey_responses (
        question_id,
        response
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
