import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import BracketItemCard from '@/components/BracketItemCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, ImageIcon, ChevronUp, ChevronDown, Shuffle, Trash2, Pencil, X } from 'lucide-react';
import { createItem, updateItem, deleteItem } from '@/lib/db';
import { toast } from 'sonner';
import { shuffle } from '@/lib/bracket';

async function fileToBase64(file, maxBytes = 700_000) {
  if (file.size > 4_000_000) throw new Error('Image too large (max 4MB)');
  // resize to <= 800px wide if needed
  const img = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = r.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const max = 600;
  const ratio = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  let q = 0.85;
  let dataUrl = c.toDataURL('image/webp', q);
  while (dataUrl.length > maxBytes && q > 0.3) {
    q -= 0.1;
    dataUrl = c.toDataURL('image/webp', q);
  }
  return dataUrl;
}

export default function AdminItemsTab({ game, items, reload }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // item or null
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colorBg, setColorBg] = useState('');
  const [colorText, setColorText] = useState('');
  const [colorBorder, setColorBorder] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  function openCreate() {
    setEditing(null); setName(''); setDescription(''); setImageUrl('');
    setColorBg(''); setColorText(''); setColorBorder('');
    setOpen(true);
  }
  function openEdit(it) {
    setEditing(it); setName(it.name || ''); setDescription(it.description || '');
    setImageUrl(it.image_url || '');
    setColorBg(it.color_json?.bg || ''); setColorText(it.color_json?.text || ''); setColorBorder(it.color_json?.border || '');
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) { toast.error('Name required'); return; }
    setBusy(true);
    try {
      const colorJson = {};
      if (colorBg) colorJson.bg = colorBg;
      if (colorText) colorJson.text = colorText;
      if (colorBorder) colorJson.border = colorBorder;
      if (editing) {
        await updateItem(editing.id, {
          name: name.trim(), description: description.trim() || null,
          image_url: imageUrl || null, color_json: colorJson,
        });
        toast.success('Item updated');
      } else {
        const sortOrder = items.length;
        await createItem({
          game_id: game.id, name: name.trim(), description: description.trim() || null,
          image_url: imageUrl || null, sort_order: sortOrder, seed_number: sortOrder + 1,
          color_json: colorJson,
        });
        toast.success('Item added');
      }
      setOpen(false);
      reload();
    } catch (e) { toast.error(e.message || 'Could not save'); }
    finally { setBusy(false); }
  }

  async function moveUp(it) {
    const idx = items.findIndex((x) => x.id === it.id);
    if (idx <= 0) return;
    const prev = items[idx - 1];
    await updateItem(it.id, { sort_order: prev.sort_order });
    await updateItem(prev.id, { sort_order: it.sort_order });
    reload();
  }
  async function moveDown(it) {
    const idx = items.findIndex((x) => x.id === it.id);
    if (idx >= items.length - 1) return;
    const nxt = items[idx + 1];
    await updateItem(it.id, { sort_order: nxt.sort_order });
    await updateItem(nxt.id, { sort_order: it.sort_order });
    reload();
  }
  async function randomize() {
    const ids = shuffle(items.map((x) => x.id));
    for (let i = 0; i < ids.length; i++) {
      await updateItem(ids[i], { sort_order: i, seed_number: i + 1 });
    }
    toast.success('Items randomized');
    reload();
  }
  async function remove(it) {
    await deleteItem(it.id);
    toast.message('Item removed');
    reload();
  }
  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b64 = await fileToBase64(f);
      setImageUrl(b64);
    } catch (err) { toast.error(err.message); }
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <BigCTAButton onClick={openCreate} testId="items-add-button"><Plus className="w-4 h-4" /> Add item</BigCTAButton>
        {items.length > 1 && (
          <BigCTAButton variant="secondary" onClick={randomize} testId="items-randomize-button"><Shuffle className="w-4 h-4" /> Randomize order</BigCTAButton>
        )}
        <span className="text-xs text-[color:var(--cb-muted)] ml-2">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>
      {items.length === 0 ? (
        <GlowCard className="p-8 text-center" testId="items-empty">
          <div className="font-display text-xl">No items yet</div>
          <p className="text-sm text-[color:var(--cb-muted)] mt-2">Add at least 2 items to launch a bracket.</p>
        </GlowCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((it) => (
            <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <GlowCard className="p-3 sm:p-4" testId={`item-row-${it.id}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <BracketItemCard item={it} state="default" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="p-1.5 rounded hover:bg-white/5" onClick={() => moveUp(it)} title="Move up" data-testid={`item-up-${it.id}`}><ChevronUp className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-white/5" onClick={() => moveDown(it)} title="Move down" data-testid={`item-down-${it.id}`}><ChevronDown className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="p-1.5 rounded hover:bg-white/5" onClick={() => openEdit(it)} title="Edit" data-testid={`item-edit-${it.id}`}><Pencil className="w-4 h-4" /></button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1.5 rounded hover:bg-white/5 text-[color:var(--cb-danger)]" title="Delete" data-testid={`item-delete-${it.id}`}><Trash2 className="w-4 h-4" /></button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this item?</AlertDialogTitle>
                          <AlertDialogDescription>If a bracket has been generated, you should regenerate it after removing items.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(it)} className="bg-[color:var(--cb-danger)] text-black">Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]" data-testid="item-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Edit item' : 'Add item'}</DialogTitle>
            <DialogDescription>Item name, image, and optional colors.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label className="text-xs text-[color:var(--cb-muted)]">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="item-name-input" className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
            </div>
            <div>
              <Label className="text-xs text-[color:var(--cb-muted)]">Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} data-testid="item-description-input" className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
            </div>
            <div>
              <Label className="text-xs text-[color:var(--cb-muted)]">Image (optional)</Label>
              <div className="mt-1 flex items-center gap-3">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="" className="w-16 h-16 rounded-[10px] object-cover border border-[color:var(--cb-border)]" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-[color:var(--cb-danger)] text-black rounded-full p-1" data-testid="item-remove-image"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-[10px] border border-dashed border-[color:var(--cb-border)] flex items-center justify-center text-[color:var(--cb-muted)]">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="item-image-file-input" />
                <BigCTAButton variant="secondary" onClick={() => fileRef.current?.click()} testId="item-image-upload-button">Upload</BigCTAButton>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-[color:var(--cb-muted)]">Bg color</Label>
                <Input value={colorBg} onChange={(e) => setColorBg(e.target.value)} placeholder="#FF4FD8" data-testid="item-color-bg" className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
              </div>
              <div>
                <Label className="text-xs text-[color:var(--cb-muted)]">Text color</Label>
                <Input value={colorText} onChange={(e) => setColorText(e.target.value)} placeholder="#000" data-testid="item-color-text" className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
              </div>
              <div>
                <Label className="text-xs text-[color:var(--cb-muted)]">Border</Label>
                <Input value={colorBorder} onChange={(e) => setColorBorder(e.target.value)} placeholder="#FF2E88" data-testid="item-color-border" className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <BigCTAButton variant="secondary" onClick={() => setOpen(false)} testId="item-edit-cancel">Cancel</BigCTAButton>
            <BigCTAButton onClick={save} loading={busy} testId="item-edit-save">Save</BigCTAButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
