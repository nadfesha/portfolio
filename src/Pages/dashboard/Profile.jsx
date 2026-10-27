import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { UserCircle, Upload, Trash2, ImageIcon, RefreshCw } from "lucide-react";

export const DEFAULT_PROFILE_IMAGE = "/nadi.jpeg";
const BUCKET = "site-assets";
const SETTING_KEY = "profile_image";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

// Ambil nama fail dalam bucket daripada public URL
const getStoragePath = (url) => {
  const marker = `/${BUCKET}/`;
  const idx = url?.indexOf(marker) ?? -1;
  return idx === -1 ? null : url.slice(idx + marker.length);
};

export default function Profile() {
  const [currentUrl, setCurrentUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfileImage = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
    setCurrentUrl(data?.value || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
  };

  const removeFromStorage = async (url) => {
    const path = getStoragePath(url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    const ext = file.name.split(".").pop().toLowerCase();
    const fileName = `profile-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file);
    if (uploadError) {
      alert("Failed to upload image: " + uploadError.message);
      setSaving(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: SETTING_KEY, value: data.publicUrl });
    if (error) {
      alert("Failed to save profile image: " + error.message);
      await supabase.storage.from(BUCKET).remove([fileName]);
      setSaving(false);
      return;
    }

    // Buang gambar lama supaya storage tak penuh
    if (currentUrl) await removeFromStorage(currentUrl);

    resetSelection();
    setSaving(false);
    fetchProfileImage();
  };

  const handleDelete = async () => {
    if (!currentUrl) return;
    if (!confirm("Delete profile photo? The default photo will be shown instead.")) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .delete()
      .eq("key", SETTING_KEY);
    if (error) {
      alert("Failed to delete profile image: " + error.message);
      setSaving(false);
      return;
    }
    await removeFromStorage(currentUrl);
    setSaving(false);
    fetchProfileImage();
  };

  const shownImage = preview || currentUrl || DEFAULT_PROFILE_IMAGE;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
          <div className="relative w-9 h-9 bg-[#1a1a2e] rounded-xl border border-white/15 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-500 text-xs">
            Profile photo shown on the About section
          </p>
        </div>
      </div>

      <Card className="max-w-xl">
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Preview */}
          <div className="relative shrink-0">
            {loading ? (
              <div className="w-40 h-40 rounded-full bg-white/5 animate-pulse" />
            ) : (
              <img
                src={shownImage}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-white/15"
              />
            )}
            {preview && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500/80 text-[10px] text-white whitespace-nowrap">
                Preview
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 w-full space-y-3">
            <p className="text-sm text-gray-400">
              {currentUrl
                ? "Using your uploaded photo."
                : "Using the default photo."}
            </p>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/15 bg-[#0d0d22] cursor-pointer hover:border-indigo-500/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  {currentUrl ? "Replace photo" : "Upload photo"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  PNG, JPG, WEBP supported
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              {preview && (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="relative group/s"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] rounded-xl border border-white/10">
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-indigo-400" />
                      )}
                      <span className="text-sm text-gray-200">
                        {saving ? "Saving..." : "Save Photo"}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={resetSelection}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
              {currentUrl && !preview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
