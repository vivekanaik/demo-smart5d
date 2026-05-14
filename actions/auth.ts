"use server";

import { cookies } from "next/headers";

export async function verifyChefPassword(password: string) {
  const expectedPassword = process.env.CHEF_PASSWORD;
  
  if (!expectedPassword) {
    // If no password is set in the environment, we might deny access or allow it depending on policy.
    // Here we'll deny to be safe, but you can change this.
    return { success: false, message: "Server misconfiguration: Password not set." };
  }

  if (password === expectedPassword) {
    // Set a cookie that the middleware will look for
    const cookieStore = await cookies();
    cookieStore.set("chef_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      // Set to expire in a day, or whatever makes sense
      maxAge: 60 * 60 * 24, 
    });
    
    return { success: true };
  }

  return { success: false, message: "Incorrect password" };
}

export async function chefLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("chef_auth");
}
