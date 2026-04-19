import client from "./client";

export const attachmentsApi = {
  upload(file: File): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return client
      .post<{ url: string; type: string }>(
        "/messages/attachments/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((r) => r.data);
  },
};
