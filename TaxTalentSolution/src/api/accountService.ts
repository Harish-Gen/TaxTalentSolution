import { apiRequest } from "./apiService";
import { API_BASE_URL } from "../utils/entra/config";

export interface SignUpOrSignInRequest {
  Token: string;
  /** Applied only when creating a new user: "candidate" | "employer" */
  Role?: string;
}

export interface SignUpOrSignInResponse {
  Token?: string;
  token?: string;
  IsNewUser?: boolean;
  isNewUser?: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    roleid?: string | null;
  };
  message?: string;
}

export async function signUpOrSignIn(
  idToken: string,
  signupRole?: "candidate" | "employer"
): Promise<SignUpOrSignInResponse> {
  const url = `${API_BASE_URL}/api/account/sign-up-or-sign-in`;
  const body: SignUpOrSignInRequest = { Token: idToken };
  if (signupRole) {
    body.Role = signupRole;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string; error?: string }).detail ||
        (errorData as { error?: string }).error ||
        `Sign up or sign in failed (${response.status})`
    );
  }

  return response.json();
}

/** Resolve backend profile by email when account API is unavailable. */
export async function loginByEmailFallback(email: string) {
  return apiRequest<{ message: string; user: { id: string; role?: { name: string } } }>(
    "/api/users/login",
    "POST",
    { email }
  );
}
