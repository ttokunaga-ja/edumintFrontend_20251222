import React from 'react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ProblemMetaBlock } from '@/components/page/ProblemViewEditPage/ProblemMetaBlock';
import { StructureAnalysisEditor } from '../ProblemEditor/StructureAnalysisEditor'; type AnalysisPhaseProps = { exam: any; onChange: (exam: any) => void; onBack: () => void; onNext: () => void;
}; export function AnalysisPhase({ exam, onChange, onBack, onNext }: AnalysisPhaseProps) { return ( <div > <div style={{ display: undefined, alignItems: "center" }> <div> <h2 >構造の確認と編集</h2> <p >解析された問題構造を確認し、必要に応じて大問・小問の構成を調整してください。</p> </div> <div style={{ display: undefined, gap: "0.75rem" }> <Button variant="outline" onClick={onBack} > 戻る </Button> <Button onClick={onNext} > 次へ進む </Button> </div> </div> <div > <div > <Card > <h3 >構造ツリー</h3> <div > <p >大問・小問の構造</p> <StructureAnalysisEditor exam={exam} onChange={onChange} /> </div> </Card> </div> <div > <ProblemMetaBlock exam={exam} isOwner onLike={() => { }} onDislike={() => { }} onBookmark={() => { }} onShare={() => { }} onReport={() => { }} onExportPDF={() => { }} /> </div> </div> </div> );
}
