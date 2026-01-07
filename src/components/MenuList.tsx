import React, { useEffect, useState } from 'react';
import {
  Layout,
  Row,
  Col,
  Button,
  Select,
  Space,
  Typography,
  Spin,
  Alert,
  Modal,
  message,
} from 'antd';
import { PlusOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMenuItems,
  fetchCategories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setSelectedCategory,
  setLanguage,
} from '../store/menuSlice';
import MenuItemCard from './MenuItemCard';
import MenuItemForm from './MenuItemForm';
import type { MenuItem, MenuItemFormData } from '../types/menu';

const { Content, Header } = Layout;
const { Title } = Typography;

const MenuList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories, loading, error, selectedCategory, selectedLanguage } = useAppSelector(
    (state) => state.menu
  );

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredItems = selectedCategory
    ? items.filter(item => item.foodCategoryId === selectedCategory)
    : items;

  const handleAddNew = () => {
    setEditingItem(null);
    setFormVisible(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'დარწმუნებული ხართ?',
      content: 'ნამდვილად გსურთ ამ კერძის წაშლა?',
      okText: 'წაშლა',
      okType: 'danger',
      cancelText: 'გაუქმება',
      onOk: async () => {
        try {
          await dispatch(deleteMenuItem(id)).unwrap();
          message.success('კერძი წარმატებით წაიშალა');
        } catch (error) {
          message.error('წაშლა ვერ მოხერხდა');
        }
      },
    });
  };

  const handleFormSubmit = async (values: MenuItemFormData) => {
    try {
      if (editingItem) {
        await dispatch(updateMenuItem({ ...values, id: editingItem.id } as MenuItem)).unwrap();
        message.success('კერძი წარმატებით განახლდა');
      } else {
        await dispatch(addMenuItem(values as Omit<MenuItem, 'id'>)).unwrap();
        message.success('კერძი წარმატებით დაემატა');
      }
      setFormVisible(false);
      setEditingItem(null);
    } catch (error) {
      message.error('ოპერაცია ვერ შესრულდა');
    }
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingItem(null);
  };

  const handleCategoryChange = (value: string | null) => {
    dispatch(setSelectedCategory(value));
  };

  const handleLanguageChange = (value: 'ka' | 'en') => {
    dispatch(setLanguage(value));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              რესტორნის მენიუ
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 120 }}
                value={selectedLanguage}
                onChange={handleLanguageChange}
                suffixIcon={<GlobalOutlined />}
              >
                <Select.Option value="ka">ქართული</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
                ახალი კერძი
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '50px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Select
                style={{ width: 200 }}
                placeholder="ყველა კატეგორია"
                allowClear
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {selectedLanguage === 'ka' ? cat.nameKa : cat.nameEn}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Typography.Text type="secondary">
                მთლიანი: {filteredItems.length} კერძი
              </Typography.Text>
            </Col>
          </Row>

          {error && (
            <Alert
              message="შეცდომა"
              description={error}
              type="error"
              closable
            />
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredItems.map(item => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                  <MenuItemCard
                    item={item}
                    language={selectedLanguage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Col>
              ))}
            </Row>
          )}

          {!loading && filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Typography.Text type="secondary">
                კერძები არ მოიძებნა
              </Typography.Text>
            </div>
          )}
        </Space>
      </Content>

      <MenuItemForm
        visible={formVisible}
        item={editingItem}
        categories={categories}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </Layout>
  );
};

export default MenuList;
