import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Avatar } from "../ui";

interface ProfileImageUploadProps {
  currentImage: string | null;
  googleImage: string | null;
  userName: string | null;
  userEmail: string;
  onSuccess?: (imageKey: string) => void;
}

export function ProfileImageUpload({
  currentImage,
  googleImage,
  userName,
  userEmail,
  onSuccess,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The displayed image: uploaded preview > current custom image > Google image
  const displayImage = previewUrl || (currentImage ? `/img/profile/${currentImage}` : googleImage);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: JPG, PNG, GIF, WebP");
      return;
    }

    // Validate file size (4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError("File too large. Maximum size is 4 MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Upload to blob storage
      const uploadResponse = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || "Upload failed");
      }

      const { key } = await uploadResponse.json();

      // Save the key to the database
      const saveResponse = await fetch("/api/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.error || "Failed to save image");
      }

      setUploadedKey(key);
      onSuccess?.(key);

      // Update preview to use the CDN URL
      setPreviewUrl(`/img/profile/${key}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-primary-200 mb-2">
        Profile Photo
      </label>

      <div className="flex items-center gap-6">
        {/* Current avatar preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-500/50">
            {displayImage ? (
              <img
                src={displayImage}
                alt={userName || userEmail}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-700 flex items-center justify-center">
                <span className="text-2xl font-medium text-white">
                  {(userName || userEmail)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>

          <p className="mt-2 text-xs text-primary-400">
            JPG, PNG, GIF, or WebP. Max 4 MB.
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}

          {uploadedKey && !error && (
            <p className="mt-2 text-sm text-green-400">Photo uploaded successfully!</p>
          )}

          {!currentImage && googleImage && !uploadedKey && (
            <p className="mt-2 text-xs text-primary-500">
              Currently using your Google profile photo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
