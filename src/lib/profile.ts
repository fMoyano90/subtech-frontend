import { saveToken } from "./auth";
import { fetchWithAuth } from "./api";

export interface ProfileUser {
  id: string;
  email: string;
  businessId: string;
  name: string;
  rut: string;
  phone: string;
  occupation: string;
  role: "admin" | "user";
  createdAt: number;
}

export interface UpdateMyProfileInput {
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UpdateMyProfileResponse {
  user: ProfileUser;
  accessToken: string;
}

export function getMyProfile(): Promise<ProfileUser> {
  return fetchWithAuth<ProfileUser>("/users/me");
}

export async function updateMyProfile(
  payload: UpdateMyProfileInput,
): Promise<ProfileUser> {
  const response = await fetchWithAuth<UpdateMyProfileResponse>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  saveToken(response.accessToken);
  return response.user;
}
