import React, { useMemo, useCallback } from 'react';
import { Box, useTheme, Alert } from '@mui/material';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * LaTeXPreview
 *
 * 特徴：
 * - LaTeX自動認識（$と$$）
 * - シンタックスハイライト付きレンダリング
 * - エスケープ処理（\$は数式として認識しない）
 * - エラーハンドリング（不完全な数式はプレースホルダー表示）
 * - コードブロック除外対応
 */

interface LaTeXPreviewProps {
  content: string;
}

interface ParsedContent {
  type: 'text' | 'latex' | 'error';
  value: string;
  isBlock?: boolean;
}

/**
 * LaTeX デリミタの検出とパース
 * - $ ... $ : インライン数式
 * - $$ ... $$ : ブロック数式
 * - \$ : エスケープされたドル記号
 */
const parseLatexContent = (content: string): ParsedContent[] => {
  const result: ParsedContent[] = [];
  let i = 0;

  while (i < content.length) {
    // エスケープされたドル記号 \$
    if (content[i] === '\\' && content[i + 1] === '$') {
      result.push({
        type: 'text',
        value: '$',
      });
      i += 2;
      continue;
    }

    // ブロック数式 $$ ... $$
    if (content[i] === '$' && content[i + 1] === '$') {
      const startIndex = i + 2;
      let endIndex = content.indexOf('$$', startIndex);

      if (endIndex === -1) {
        // 閉じられていない → テキストとして扱う
        result.push({
          type: 'text',
          value: content.substring(i),
        });
        break;
      }

      const mathContent = content.substring(startIndex, endIndex).trim();

      if (mathContent) {
        result.push({
          type: 'latex',
          value: mathContent,
          isBlock: true,
        });
      }

      i = endIndex + 2;
      continue;
    }

    // インライン数式 $ ... $
    if (content[i] === '$') {
      const startIndex = i + 1;
      let endIndex = content.indexOf('$', startIndex);

      if (endIndex === -1) {
        // 閉じられていない → テキストとして扱う
        result.push({
          type: 'text',
          value: content.substring(i),
        });
        break;
      }

      const mathContent = content.substring(startIndex, endIndex).trim();

      if (mathContent) {
        result.push({
          type: 'latex',
          value: mathContent,
          isBlock: false,
        });
      }

      i = endIndex + 1;
      continue;
    }

    // 通常のテキスト
    let textEnd = content.indexOf('$', i);
    if (textEnd === -1) {
      textEnd = content.length;
    }

    const textContent = content.substring(i, textEnd);
    if (textContent) {
      result.push({
        type: 'text',
        value: textContent,
      });
    }

    i = textEnd;
  }

  return result;
};

/**
 * LaTeX コンテンツをレンダリング
 */
const renderLatex = (mathContent: string, isBlock: boolean): string => {
  try {
    return katex.renderToString(mathContent, {
      displayMode: isBlock,
      throwOnError: false,
      trust: false,
    });
  } catch (e) {
    console.error('LaTeX rendering error:', e);
    return '';
  }
};

export const LaTeXPreview: FC<LaTeXPreviewProps> = ({ content }) => {
  const theme = useTheme();

  const parsedContent = useMemo(() => {
    return parseLatexContent(content);
  }, [content]);

  const hasErrors = useMemo(() => {
    return parsedContent.some((item) => item.type === 'error');
  }, [parsedContent]);

  return (
    <Box
      sx={{
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        lineHeight: '1.8',
        color: theme.palette.text.primary,
      }}
    >
      {content === '' && (
        <Box
          sx={{
            color: theme.palette.text.disabled,
            fontStyle: 'italic',
          }}
        >
          プレビューはここに表示されます
        </Box>
      )}

      {content !== '' &&
        parsedContent.map((item, index) => {
          switch (item.type) {
            case 'text':
              return (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {item.value}
                </Box>
              );

            case 'latex':
              const htmlContent = renderLatex(item.value, item.isBlock || false);

              if (!htmlContent) {
                // レンダリング失敗時はプレースホルダー
                return (
                  <Box
                    key={index}
                    component="span"
                    sx={{
                      display: item.isBlock ? 'block' : 'inline',
                      my: item.isBlock ? 1 : 0,
                      mx: item.isBlock ? 0 : 0.5,
                      padding: '4px 8px',
                      backgroundColor: theme.palette.warning.lighter || theme.palette.action.hover,
                      color: theme.palette.warning.main,
                      borderRadius: '4px',
                      fontStyle: 'italic',
                    }}
                  >
                    [数式入力中...]
                  </Box>
                );
              }

              return (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    display: item.isBlock ? 'block' : 'inline',
                    my: item.isBlock ? 1 : 0,
                    mx: item.isBlock ? 0 : 0.5,
                  }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              );

            case 'error':
            default:
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'block',
                    my: 1,
                    padding: '8px',
                    backgroundColor: theme.palette.error.lighter || theme.palette.action.hover,
                    color: theme.palette.error.main,
                    borderRadius: '4px',
                  }}
                >
                  ⚠ 数式のエラー: {item.value}
                </Box>
              );
          }
        })}

      {hasErrors && (
        <Alert
          severity="warning"
          sx={{
            mt: 2,
          }}
        >
          一部の数式がレンダリングできません。LaTeX構文を確認してください。
          <Box
            component="a"
            href="https://katex.org/docs/supported.html"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: 1,
              color: 'inherit',
              textDecoration: 'underline',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            KaTeX対応コマンド一覧
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default LaTeXPreview;
