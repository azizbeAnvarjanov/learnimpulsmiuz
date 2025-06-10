import { NextResponse } from "next/server";
import { supabase } from "@/app/supabaseClient";

export async function POST(request) {
  const body = await request.json();
  const { user_info, responses } = body;

  // Янги сўров яратиш
  const { data: survey, error: surveyError } = await supabase
    .from("surveys")
    .insert([{ user_info, completed: true }])
    .select()
    .single();

  if (surveyError) {
    return NextResponse.json({ error: surveyError.message }, { status: 500 });
  }

  // Жавобларни сақлаш
  const responseEntries = responses.map((res) => ({
    survey_id: survey.id,
    question_id: res.question_id,
    response: JSON.stringify(res.response),
  }));

  const { error: responseError } = await supabase
    .from("survey_responses")
    .insert(responseEntries);

  if (responseError) {
    return NextResponse.json({ error: responseError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Responses saved successfully" });
}
