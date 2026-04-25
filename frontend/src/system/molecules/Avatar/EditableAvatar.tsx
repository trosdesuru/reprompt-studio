"use client";

import { useRef } from "react";
import { UserAvatar, UserAvatarProps } from "@/src/system/atoms/Avatar/Avatar";
import { useAvatarUpload } from "@/src/utils/hooks/useAvatarUpload";

export interface EditableAvatarProps extends Omit<
  UserAvatarProps,
  "isUploading" | "onClick" | "editable"
> {
  onAvatarUpdate?: (newUrl: string) => void;
}

export function EditableAvatar({
  username,
  avatarUrl,
  onAvatarUpdate,
  ...props
}: EditableAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, localAvatar, uploadAvatar } = useAvatarUpload(username, onAvatarUpdate);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayUrl = localAvatar !== undefined ? localAvatar : avatarUrl;

  return (
    <>
      <UserAvatar
        username={username}
        avatarUrl={displayUrl}
        isUploading={isUploading}
        editable={true}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        {...props}
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </>
  );
}
