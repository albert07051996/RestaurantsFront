import React from 'react';
import { Card, Tag, Space, Typography, Image, Button, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { MenuItem } from '../types/menu';

const { Text, Title, Paragraph } = Typography;

interface MenuItemCardProps {
  item: MenuItem;
  language: 'ka' | 'en';
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, language, onEdit, onDelete }) => {
  const name = language === 'ka' ? item.nameKa : item.nameEn;
  const description = language === 'ka' ? item.descriptionKa : item.descriptionEn;
  const ingredients = language === 'ka' ? item.ingredients : item.ingredientsEn;

  return (
    <Card
      hoverable
      cover={
        item.imageUrl ? (
          <Image
            alt={name}
            src={item.imageUrl}
            height={200}
            style={{ objectFit: 'cover' }}
            preview={true}
          />
        ) : null
      }
      actions={[
        <Tooltip title="რედაქტირება">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(item)}
          />
        </Tooltip>,
        <Tooltip title="წაშლა">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(item.id)}
          />
        </Tooltip>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Title level={4} style={{ margin: 0 }}>
            {name}
          </Title>
          {item.price && (
            <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
              ₾{item.price.toFixed(2)}
            </Text>
          )}
        </div>

        {description && (
          <Paragraph
            ellipsis={{ rows: 2, expandable: true }}
            style={{ marginBottom: 8 }}
          >
            {description}
          </Paragraph>
        )}

        <Space wrap>
          {item.isAvailable ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              ხელმისაწვდომი
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">
              მიუწვდომელი
            </Tag>
          )}

          {item.isVeganFood && <Tag color="green">ვეგანური</Tag>}

          {item.preparationTimeMinutes && (
            <Tag icon={<ClockCircleOutlined />}>
              {item.preparationTimeMinutes} წთ
            </Tag>
          )}

          {item.spicyLevel && item.spicyLevel > 0 && (
            <Tag icon={<FireOutlined />} color="volcano">
              სიცხე: {item.spicyLevel}
            </Tag>
          )}

          {item.calories && <Tag>{item.calories} კალ</Tag>}

          {item.volume && <Tag>{item.volume}</Tag>}

          {item.alcoholContent && (
            <Tag color="purple">ალკოჰოლი: {item.alcoholContent}</Tag>
          )}
        </Space>

        {ingredients && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" strong style={{ fontSize: '12px' }}>
              ინგრედიენტები:
            </Text>
            <Paragraph
              type="secondary"
              style={{ fontSize: '12px', marginTop: 4 }}
              ellipsis={{ rows: 1, expandable: true }}
            >
              {ingredients}
            </Paragraph>
          </div>
        )}

        {item.comment && (
          <Text italic type="secondary" style={{ fontSize: '12px' }}>
            {item.comment}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default MenuItemCard;
