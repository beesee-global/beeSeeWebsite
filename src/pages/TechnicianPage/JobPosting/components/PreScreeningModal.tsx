import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface PreScreeningChoice {
  id: number;
  choice_text: string;
  value: string;
  sort_order: number;
  created_at: string | null;
}

interface PreScreeningQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'number' | 'yes_no';
  created_at: string;
  choices?: PreScreeningChoice[];
}

interface SelectedPreScreening {
  id?: number;           // careers_pre_screening row id — present when editing existing
  instance_id: string;
  question_id: number;
  is_deal_breaker: 0 | 1;
  deal_breaker_expected_value?: string;
  blank_value?: string;
  answer?: string;
}

interface PreScreeningModalProps {
  open: boolean;
  onClose: () => void;
  questions: PreScreeningQuestion[];
  onAdd: (selection: SelectedPreScreening) => void;
  onRemove: (instanceId: string) => void;
  onUpdate: (selection: SelectedPreScreening) => void;
  selectedQuestions: SelectedPreScreening[];
  jobLocation?: string;
}

const BLANK_REGEX = /_{2,}/;
const isLocationQuestion = (q: string) => q.toLowerCase().includes('located in');

const isTrailingBlank = (q: string) => {
  const t = q.trim().toLowerCase();
  return t.endsWith('to') || t.endsWith('valid') || t.endsWith('located in') || t.endsWith('in');
};

const buildDisplay = (question: string, blankVal?: string, liveLocation?: string) => {
  const resolved = isLocationQuestion(question)
    ? (liveLocation?.trim() || blankVal?.trim() || '')
    : (blankVal?.trim() || '');
  if (!resolved) return question.trim();
  if (BLANK_REGEX.test(question)) return question.trim().replace(BLANK_REGEX, resolved);
  if (isTrailingBlank(question)) return `${question.trim()} ${resolved}`;
  return question.trim();
};

const generateInstanceId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function PreScreeningModal({
  open,
  onClose,
  questions,
  onAdd,
  onRemove,
  onUpdate,
  selectedQuestions,
  jobLocation = '',
}: PreScreeningModalProps) {
  if (!open) return null;

  const getSelected = (instanceId: string) =>
    selectedQuestions.find((q) => q.instance_id === instanceId);

  const handleAdd = (question: PreScreeningQuestion) => {
    let defaultAnswer = '';
    if (question.type === 'yes_no') defaultAnswer = 'Yes';
    else if (question.type === 'multiple_choice' && question.choices?.length) {
      defaultAnswer = question.choices[0].value;
    }

    const autoBlank = isLocationQuestion(question.question) && jobLocation?.trim()
      ? jobLocation.trim()
      : '';

    // id is undefined for new additions — backend will INSERT
    onAdd({
      instance_id: generateInstanceId(),
      question_id: question.id,
      is_deal_breaker: 0,
      deal_breaker_expected_value: '',
      blank_value: autoBlank,
      answer: defaultAnswer,
    });
  };

  const handleBlankChange = (instanceId: string, value: string) => {
    const sel = getSelected(instanceId);
    if (!sel) return;
    onUpdate({ ...sel, blank_value: value });
  };

  const handleAnswerChange = (instanceId: string, value: string) => {
    const sel = getSelected(instanceId);
    if (!sel) return;
    onUpdate({
      ...sel,
      answer: value,
      deal_breaker_expected_value: sel.is_deal_breaker === 1 ? value : sel.deal_breaker_expected_value,
    });
  };

  const handleDealBreakerToggle = (instanceId: string) => {
    const sel = getSelected(instanceId);
    if (!sel) return;
    const question = questions.find((q) => q.id === sel.question_id);
    const next: 0 | 1 = sel.is_deal_breaker === 1 ? 0 : 1;

    let resolvedAnswer = sel.answer ?? '';
    if (next === 1 && !resolvedAnswer) {
      if (question?.type === 'yes_no') resolvedAnswer = 'Yes';
      else if (question?.type === 'multiple_choice' && question.choices?.length) {
        resolvedAnswer = question.choices[0].value;
      }
    }

    onUpdate({
      ...sel,
      answer: resolvedAnswer || sel.answer,
      is_deal_breaker: next,
      deal_breaker_expected_value: next === 1 ? resolvedAnswer : '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customize Pre-screening Questions</h2>
            <p className="text-sm text-gray-600 mt-1">Select questions to screen applicants</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* ── SELECTED (top) ── */}
          {selectedQuestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Selected ({selectedQuestions.length})
              </p>

              {selectedQuestions.map((sel) => {
                const question = questions.find((q) => q.id === sel.question_id);
                if (!question) return null;

                const isLocQ = isLocationQuestion(question.question);
                const hasUnderscoreBlank = BLANK_REGEX.test(question.question);
                const hasTrailingBlank = isTrailingBlank(question.question);
                const needsBlankInput = (hasUnderscoreBlank || hasTrailingBlank) && !isLocQ;
                const isMultiChoice = question.type === 'multiple_choice';
                const isYesNo = question.type === 'yes_no';

                return (
                  <div
                    key={sel.instance_id}
                    className="border border-blue-300 bg-blue-50 rounded-lg p-4 space-y-3"
                  >
                    {/* Title + remove + row id badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {buildDisplay(question.question, sel.blank_value, jobLocation)}
                        </p>
                        {/* Show row id when editing existing — useful for debugging */}
                        {/* {sel.id !== undefined && (
                          <p className="text-xs text-gray-400 mt-0.5">Row ID: {sel.id}</p>
                        )} */}
                      </div>
                      <button
                        onClick={() => onRemove(sel.instance_id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Blank fill-in (not for location — auto-filled) */}
                    {needsBlankInput && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fill in the blank</label>
                        <input
                          type="text"
                          value={sel.blank_value ?? ''}
                          onChange={(e) => handleBlankChange(sel.instance_id, e.target.value)}
                          placeholder="Fill in the blank…"
                          className="w-full px-3 py-1.5 border text-black border-blue-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Answer selection */}
                    <div className="space-y-3">
                      {isYesNo ? (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Expected answer</label>
                          <div className="flex gap-4">
                            {['Yes', 'No'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`answer-${sel.instance_id}`}
                                  value={opt}
                                  checked={sel.answer === opt}
                                  onChange={(e) => handleAnswerChange(sel.instance_id, e.target.value)}
                                  className="w-4 h-4 text-blue-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : isMultiChoice && question.choices ? (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Expected answer</label>
                          <div className="flex flex-col gap-2">
                            {question.choices.map((choice) => (
                              <label key={choice.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`answer-${sel.instance_id}`}
                                  value={choice.value}
                                  checked={sel.answer === choice.value}
                                  onChange={(e) => handleAnswerChange(sel.instance_id, e.target.value)}
                                  className="w-4 h-4 text-blue-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{choice.choice_text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Expected answer</label>
                          <input
                            type={question.type === 'number' ? 'number' : 'text'}
                            value={sel.answer ?? ''}
                            onChange={(e) => handleAnswerChange(sel.instance_id, e.target.value)}
                            placeholder="Expected answer"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        </div>
                      )}

                      {/* Deal breaker */}
                      {(isMultiChoice || isYesNo) && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`db-${sel.instance_id}`}
                            checked={sel.is_deal_breaker === 1}
                            onChange={() => handleDealBreakerToggle(sel.instance_id)}
                            className="w-4 h-4 text-blue-500 rounded cursor-pointer"
                          />
                          <label
                            htmlFor={`db-${sel.instance_id}`}
                            className="text-xs text-gray-700 cursor-pointer font-medium"
                          >
                            Mark as deal breaker
                            <span className="text-gray-400 font-normal ml-1">
                              (ranks applicants who don't match lower)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedQuestions.length > 0 && <div className="border-t border-gray-200" />}

          {/* ── STANDARD QUESTIONS (picker) ── */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Standard Questions
              </p>
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="border border-gray-200 hover:border-gray-300 bg-white rounded-lg p-4 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{question.question.trim()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Type: {question.type.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(question)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {questions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No pre-screening questions available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 flex justify-between items-center flex-shrink-0">
          <span className="text-sm text-gray-600">
            {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}