import { AnswerCard } from "./answer-card";

interface AnswerListProps {
  answers: Array<{
    id: string;
    authorName: string;
    body: string;
    isAccepted: boolean;
    createdAt: string;
  }>;
  canAccept?: boolean;
  onAccept?: (answerId: string) => void;
}

export function AnswerList({ answers, canAccept, onAccept }: AnswerListProps) {
  if (answers.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        暂无回答
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {answers.map((a) => (
        <AnswerCard
          key={a.id}
          {...a}
          canAccept={canAccept}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
}
