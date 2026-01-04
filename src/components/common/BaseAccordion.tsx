import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface BaseAccordionProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void;
  children?: ReactNode;
  headerAction?: ReactNode;
}

/**
 * ベースアコーディオンコンポーネント
 * 
 * アコーディオンの共通構造（展開・折りたたみ、ヘッダー、コンテンツ）を提供
 * 具体的なセクション（プロフィール編集、ウォレットなど）の親コンポーネント
 * 
 * @param id - アコーディオンの一意識別子
 * @param title - アコーディオンのタイトル
 * @param isExpanded - 展開状態
 * @param onChange - 展開状態の変更ハンドラ
 * @param children - アコーディオン内のコンテンツ
 * @param headerAction - ヘッダーに配置するアクション（ボタンなど）
 */
export const BaseAccordion: FC<BaseAccordionProps> = ({
  id,
  title,
  isExpanded,
  onChange,
  children,
  headerAction,
}) => {
  return (
    <Accordion expanded={isExpanded} onChange={onChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
        {headerAction && (
          <Box sx={{ ml: 1 }} onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </Box>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default BaseAccordion;
