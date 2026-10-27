import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Plus, Trash2, Upload, Boxes, X, ImageIcon, Pencil } from "lucide-react";

const BUCKET = "site-assets";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-md flex flex-col" style={{ maxHeight: "calc(100vh - 24px)" }}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

// Ambil nama fail dalam bucket daripada public URL (null kalau logo dari folder public)
const getStoragePath = (url) => {
  const marker = `/${BUCKET}/`;
  const idx = url?.indexOf(marker) ?? -1;
  return idx === -1 ? null : url.slice(idx + marker.length);
};

const TechForm = ({ initial, onSubmit, onCancel, submitLabel, uploading }) => {
  const [name, setName] = useState(initial?.name || "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.icon || null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initial && !file) {
      alert("Please upload a logo image.");
      return;
    }
    onSubmit({ name, sort_order: Number(sortOrder) || 0 }, file);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <InputField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. ReactJS"
        required
      />
      <InputField
        label="Order (smaller shows first)"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
          Logo
        </label>
        <label className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/15 bg-[#0d0d22] cursor-pointer hover:border-indigo-500/50 transition-colors">
          {preview ? (
            <img src={preview} alt="preview" className="w-16 h-16 object-contain rounded-lg bg-white/5 p-2 border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-300">{preview ? "Change logo" : "Click to upload logo"}</p>
            <p className="text-xs text-gray-600 mt-0.5">SVG, PNG, WEBP (transparent background looks best)</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="relative group/s">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
          <div className="relative flex items-center gap-2 px-5 py-2 bg-[#1a1a2e] rounded-xl border border-white/10">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-sm text-gray-200">{uploading ? "Saving..." : submitLabel}</span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default function TechStacks() {
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editStack, setEditStack] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchStacks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tech_stacks")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });
    setStacks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStacks();
  }, []);

  const uploadLogo = async (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    const fileName = `tech-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, f);
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const removeLogo = async (url) => {
    const path = getStoragePath(url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  };

  const handleCreate = async (form, file) => {
    setUploading(true);
    let icon;
    try {
      icon = await uploadLogo(file);
    } catch (err) {
      alert("Failed to upload logo: " + err.message);
      setUploading(false);
      return;
    }
    const { error } = await supabase.from("tech_stacks").insert({ ...form, icon });
    if (error) {
      alert("Failed to add tech stack: " + error.message);
      await removeLogo(icon);
      setUploading(false);
      return;
    }
    setShowCreate(false);
    setUploading(false);
    fetchStacks();
  };

  const handleEdit = async (form, file) => {
    setUploading(true);
    let icon = editStack.icon;
    try {
      if (file) icon = await uploadLogo(file);
    } catch (err) {
      alert("Failed to upload logo: " + err.message);
      setUploading(false);
      return;
    }
    const { error } = await supabase
      .from("tech_stacks")
      .update({ ...form, icon })
      .eq("id", editStack.id);
    if (error) {
      alert("Failed to update tech stack: " + error.message);
      setUploading(false);
      return;
    }
    if (file) await removeLogo(editStack.icon);
    setEditStack(null);
    setUploading(false);
    fetchStacks();
  };

  const deleteStack = async (stack) => {
    if (!confirm(`Delete "${stack.name}"?`)) return;
    const { error } = await supabase.from("tech_stacks").delete().eq("id", stack.id);
    if (error) {
      alert("Failed to delete tech stack: " + error.message);
      return;
    }
    await removeLogo(stack.icon);
    fetchStacks();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
            <div className="relative w-9 h-9 bg-[#1a1a2e] rounded-xl border border-white/15 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Tech Stack</h1>
            <p className="text-gray-500 text-xs">
              {loading ? "Loading..." : `${stacks.length} technologies total`}
            </p>
          </div>
        </div>

        <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
          <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e] rounded-xl border border-white/10">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-gray-200">New Tech</span>
          </div>
        </button>
      </div>

      {showCreate && (
        <Modal title="Add Tech Stack" onClose={() => setShowCreate(false)}>
          <TechForm
            initial={{ sort_order: stacks.length + 1 }}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save Tech"
            uploading={uploading}
          />
        </Modal>
      )}

      {editStack && (
        <Modal title="Edit Tech Stack" onClose={() => setEditStack(null)}>
          <TechForm
            initial={editStack}
            onSubmit={handleEdit}
            onCancel={() => setEditStack(null)}
            submitLabel="Update Tech"
            uploading={uploading}
          />
        </Modal>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/5 border border-white/12 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : stacks.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <Boxes className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tech stack yet. Add your first one!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stacks.map((stack) => (
            <Card key={stack.id}>
              <div className="p-4 flex flex-col items-center gap-3 h-full">
                <img src={stack.icon} alt={stack.name} className="w-14 h-14 object-contain" />
                <p className="text-sm font-medium text-white text-center">{stack.name}</p>
                <div className="mt-auto flex gap-2 pt-2 border-t border-white/8 w-full justify-center">
                  <button
                    onClick={() => setEditStack(stack)}
                    className="p-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteStack(stack)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
