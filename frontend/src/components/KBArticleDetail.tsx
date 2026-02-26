import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Eye, Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { KBArticle, KnowledgeCategory } from '../backend';
import { useIncrementArticleViewCount, useDeleteKBArticle } from '../hooks/useKnowledgeBase';

interface KBArticleDetailProps {
  article: KBArticle;
  isAdmin?: boolean;
  onBack?: () => void;
  onEdit?: (article: KBArticle) => void;
}

const categoryLabels: Record<string, string> = {
  PrintersPeripherals: 'Printers & Peripherals',
  NetworkConnectivity: 'Network & Connectivity',
  AccountPasswords: 'Account & Passwords',
  HardwareSupport: 'Hardware Support',
  SoftwareSupport: 'Software Support',
  GeneralSupport: 'General Support',
  WindowsSupport: 'Windows Support',
};

function getCategoryKey(category: KnowledgeCategory): string {
  return String(category);
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function KBArticleDetail({ article, isAdmin, onBack, onEdit }: KBArticleDetailProps) {
  const incrementView = useIncrementArticleViewCount();
  const deleteArticle = useDeleteKBArticle();

  useEffect(() => {
    incrementView.mutate(article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const catKey = getCategoryKey(article.category);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteArticle.mutateAsync(article.id);
      onBack?.();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Knowledge Base
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit?.(article)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteArticle.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary">{categoryLabels[catKey] || catKey}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            {(Number(article.viewCount) + 1).toString()} views
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(article.createdAt)}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {article.body.split('\n').map((paragraph, idx) =>
              paragraph.trim() ? (
                <p key={idx} className="mb-3 text-sm leading-relaxed">
                  {paragraph}
                </p>
              ) : (
                <br key={idx} />
              )
            )}
          </div>
        </CardContent>
      </Card>

      {article.updatedAt !== article.createdAt && (
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {formatDate(article.updatedAt)}
        </p>
      )}
    </div>
  );
}
