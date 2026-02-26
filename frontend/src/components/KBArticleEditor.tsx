import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, Plus } from 'lucide-react';
import { KBArticle, KnowledgeCategory } from '../backend';
import { useCreateKBArticle, useUpdateKBArticle } from '../hooks/useKnowledgeBase';

interface KBArticleEditorProps {
  article?: KBArticle | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categoryOptions = [
  { value: KnowledgeCategory.PrintersPeripherals, label: 'Printers & Peripherals' },
  { value: KnowledgeCategory.NetworkConnectivity, label: 'Network & Connectivity' },
  { value: KnowledgeCategory.AccountPasswords, label: 'Account & Passwords' },
  { value: KnowledgeCategory.HardwareSupport, label: 'Hardware Support' },
  { value: KnowledgeCategory.SoftwareSupport, label: 'Software Support' },
  { value: KnowledgeCategory.GeneralSupport, label: 'General Support' },
  { value: KnowledgeCategory.WindowsSupport, label: 'Windows Support' },
];

export default function KBArticleEditor({ article, onSuccess, onCancel }: KBArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [category, setCategory] = useState<KnowledgeCategory>(
    article?.category ?? KnowledgeCategory.GeneralSupport
  );
  const [body, setBody] = useState(article?.body || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [error, setError] = useState('');

  const createArticle = useCreateKBArticle();
  const updateArticle = useUpdateKBArticle();

  const isEditing = !!article;
  const isPending = createArticle.isPending || updateArticle.isPending;

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Body is required');
      return;
    }

    try {
      if (isEditing && article) {
        await updateArticle.mutateAsync({ articleId: article.id, title, category, body, tags });
      } else {
        await createArticle.mutateAsync({ title, category, body, tags });
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Article' : 'New Article'}</h2>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kb-title">Title</Label>
          <Input
            id="kb-title"
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={String(category)}
            onValueChange={(val) => setCategory(val as KnowledgeCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kb-body">Content</Label>
          <Textarea
            id="kb-body"
            placeholder="Write the article content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Article' : 'Publish Article'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
