import React from 'react';
import { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Coins } from 'lucide-react';

interface TemplateCardProps {
  template: WorkflowTemplate;
  isSelected: boolean;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onClick,
}) => {
  return (
    <Card
      className={`cursor-pointer hover:border-primary transition-all duration-200 ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        {template.description && (
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center">
          <Coins className="h-4 w-4 text-yellow-500 mr-1" />
          <span>{template.cost} 코인</span>
        </div>
        {template.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {template.category}
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
