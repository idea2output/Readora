"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message))
  }

  revalidatePath("/", "layout")
  redirect("/profile")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get("fullName") as string
  const userId = formData.get("userId") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const location = formData.get("location") as string

  if (!fullName || !userId || !email || !password || !location) {
    redirect("/register?error=" + encodeURIComponent("All fields (Full Name, User ID, Email, Password, Location) are mandatory."))
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_id_handle: userId,
        location: location,
      },
    },
  })

  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message))
  }

  // Insert profile record if user ID created
  if (authData?.user) {
    try {
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        display_name: fullName,
      })
    } catch (_) {}
  }

  revalidatePath("/", "layout")
  redirect("/login?message=" + encodeURIComponent("Account created! Please check your email to verify your account before logging in."))
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string

  if (!email) {
    redirect("/reset-password?error=" + encodeURIComponent("Email is required."))
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile`,
  })

  if (error) {
    redirect("/reset-password?error=" + encodeURIComponent(error.message))
  }

  redirect("/reset-password?message=" + encodeURIComponent("Password recovery instructions have been sent to your email."))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath("/", "layout")
  redirect("/login")
}
