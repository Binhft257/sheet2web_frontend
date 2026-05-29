import { apiClient } from "@/src/lib/api";
import { extractServiceErrorMessage } from "@/src/services/service-utils";

export type UserProfile = {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get<UserProfile>("/auth/profile");
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải thông tin người dùng."),
    );
  }
}
