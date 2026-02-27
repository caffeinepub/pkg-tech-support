import React, { useState } from 'react';
import {
  useGetAllKBArticles,
  useSearchKBArticles,
  useGetArticlesByCategory,
  useGetKBArticle,
} from '../hooks/useKnowledgeBase';
import { KBArticle, KnowledgeCategory } from '../backend';
import { Search, BookOpen, Plus, Loader2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import KBArticleDetail from './KBArticleDetail';
import KBArticleEditor from './KBArticleEditor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  [KnowledgeCategory.PrintersPeripherals]: {
    label: 'Printers & Peripherals',
    color: 'var(--primary)',
    bg: 'oklch(0.52 0.18 195 / 0.12)',
  },
  [KnowledgeCategory.NetworkConnectivity]: {
    label: 'Network & Connectivity',
    color: 'var(--secondary)',
    bg: 'oklch(0.55 0.16 265 / 0.12)',
  },
  [KnowledgeCategory.AccountPasswords]: {
    label: 'Accounts & Passwords',
    color: 'var(--warning)',
    bg: 'oklch(0.70 0.20 45 / 0.12)',
  },
  [KnowledgeCategory.HardwareSupport]: {
    label: 'Hardware Support',
    color: 'var(--destructive)',
    bg: 'oklch(0.55 0.22 25 / 0.12)',
  },
  [KnowledgeCategory.SoftwareSupport]: {
    label: 'Software Support',
    color: 'var(--success)',
    bg: 'oklch(0.58 0.18 145 / 0.12)',
  },
  [KnowledgeCategory.GeneralSupport]: {
    label: 'General Support',
    color: 'var(--accent)',
    bg: 'oklch(0.72 0.18 55 / 0.12)',
  },
  [KnowledgeCategory.WindowsSupport]: {
    label: 'Windows Support',
    color: 'var(--primary)',
    bg: 'oklch(0.52 0.18 195 / 0.12)',
  },
};

// Inner component that fetches and renders the article detail
function ArticleDetailLoader({
  articleId,
  onBack,
  onEdit,
  isAdmin,
}: {
  articleId: bigint;
  onBack: () => void;
  onEdit: (article: KBArticle) => void;
  isAdmin: boolean;
}) {
  const { data: article, isLoading } = useGetKBArticle(articleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <p>Article not found.</p>
        <button onClick={onBack} className="mt-4 underline text-sm" style={{ color: 'var(--primary)' }}>
          Back to Knowledge Base
        </button>
      </div>
    );
  }

  return (
    <KBArticleDetail
      article={article}
      isAdmin={isAdmin}
      onBack={onBack}
      onEdit={onEdit}
    />
  );
}

export default function KnowledgeBaseView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<bigint | null>(null);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: allArticles, isLoading: loadingAll } = useGetAllKBArticles();
  const { data: searchResults, isLoading: loadingSearch } = useSearchKBArticles(searchTerm);
  const { data: categoryArticles, isLoading: loadingCategory } = useGetArticlesByCategory(selectedCategory);

  const isLoading = searchTerm
    ? loadingSearch
    : selectedCategory
    ? loadingCategory
    : loadingAll;

  const articles = searchTerm
    ? (searchResults || [])
    : selectedCategory
    ? (categoryArticles || [])
    : (allArticles || []);

  const handleEditArticle = (article: KBArticle) => {
    setEditingArticle(article);
    setShowEditor(true);
    setSelectedArticleId(null);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  // Show article detail
  if (selectedArticleId !== null) {
    return (
      <ArticleDetailLoader
        articleId={selectedArticleId}
        onBack={() => setSelectedArticleId(null)}
        onEdit={handleEditArticle}
        isAdmin={!!identity && !!isAdmin}
      />
    );
  }

  // Show article editor
  if (showEditor) {
    return (
      <KBArticleEditor
        article={editingArticle}
        onSuccess={handleEditorClose}
        onCancel={handleEditorClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--foreground)' }}>
              Knowledge Base
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        {identity && isAdmin && (
          <button
            onClick={() => { setEditingArticle(null); setShowEditor(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedCategory(null);
          }}
          placeholder="Search articles..."
          className="pl-10 rounded-xl border-2 h-11"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
          style={
            selectedCategory === null
              ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
              : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
          }
        >
          <Tag className="w-3.5 h-3.5" />
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key as KnowledgeCategory);
              setSearchTerm('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={
              selectedCategory === key
                ? { background: cfg.color, color: 'var(--primary-foreground)' }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
            }
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : articles.length === 0 ? (
        <div
          className="rounded-2xl border-2 p-12 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
            No articles found
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {searchTerm
              ? `No results for "${searchTerm}"`
              : 'No articles in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => {
            const catKey = String(article.category);
            const cfg = CATEGORY_CONFIG[catKey] || {
              label: catKey,
              color: 'var(--primary)',
              bg: 'oklch(0.52 0.18 195 / 0.12)',
            };
            return (
              <button
                key={article.id.toString()}
                onClick={() => setSelectedArticleId(article.id)}
                className="text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover interactive-card"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </div>
                <h3
                  className="font-display font-bold text-base mb-2 line-clamp-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-sm line-clamp-3 mb-3"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {article.body.substring(0, 120)}
                  {article.body.length > 120 ? '...' : ''}
                </p>
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span>{Number(article.viewCount)} views</span>
                  <span>
                    {new Date(Number(article.createdAt) / 1_000_000).toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
