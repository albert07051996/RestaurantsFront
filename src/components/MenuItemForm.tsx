import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Row,
  Col,
  message,
} from 'antd';
import type { MenuItem, MenuItemFormData, FoodCategory } from '../types/menu';

const { TextArea } = Input;

interface MenuItemFormProps {
  visible: boolean;
  item: MenuItem | null;
  categories: FoodCategory[];
  onSubmit: (values: MenuItemFormData) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  visible,
  item,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && item) {
      form.setFieldsValue(item);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, item, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      message.error('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
    }
  };

  return (
    <Modal
      title={item ? 'მენიუს რედაქტირება' : 'ახალი კერძის დამატება'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      okText="შენახვა"
      cancelText="გაუქმება"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="დასახელება (ქართული)"
              name="nameKa"
              rules={[{ required: true, message: 'შეიყვანეთ დასახელება ქართულად' }]}
            >
              <Input placeholder="დასახელება ქართულად" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="დასახელება (ინგლისური)"
              name="nameEn"
              rules={[{ required: true, message: 'შეიყვანეთ დასახელება ინგლისურად' }]}
            >
              <Input placeholder="დასახელება ინგლისურად" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="აღწერა (ქართული)"
              name="descriptionKa"
              rules={[{ required: true, message: 'შეიყვანეთ აღწერა ქართულად' }]}
            >
              <TextArea rows={3} placeholder="აღწერა ქართულად" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="აღწერა (ინგლისური)"
              name="descriptionEn"
              rules={[{ required: true, message: 'შეიყვანეთ აღწერა ინგლისურად' }]}
            >
              <TextArea rows={3} placeholder="აღწერა ინგლისურად" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="ფასი (₾)"
              name="price"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="მომზადების დრო (წუთი)"
              name="preparationTimeMinutes"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="კალორიები"
              name="calories"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="კატეგორია"
              name="foodCategoryId"
              rules={[{ required: true, message: 'აირჩიეთ კატეგორია' }]}
            >
              <Select placeholder="აირჩიეთ კატეგორია">
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.nameKa}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="სიცხის დონე (0-5)"
              name="spicyLevel"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={5}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="მოცულობა"
              name="volume"
            >
              <Input placeholder="მაგ: 500მლ, 300გრ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ალკოჰოლის შემცველობა"
              name="alcoholContent"
            >
              <Input placeholder="მაგ: 5%" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ინგრედიენტები (ქართული)"
              name="ingredients"
            >
              <TextArea rows={2} placeholder="ინგრედიენტები ქართულად" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ინგრედიენტები (ინგლისური)"
              name="ingredientsEn"
            >
              <TextArea rows={2} placeholder="ინგრედიენტები ინგლისურად" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="სურათის URL"
              name="imageUrl"
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ვიდეოს URL"
              name="videoUrl"
            >
              <Input placeholder="https://example.com/video.mp4" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="კომენტარი"
          name="comment"
        >
          <TextArea rows={2} placeholder="დამატებითი ინფორმაცია" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="ხელმისაწვდომია"
              name="isAvailable"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="ვეგანური"
              name="isVeganFood"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default MenuItemForm;
