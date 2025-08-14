'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Space, message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshUser } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        message.success('退出成功！');
        await refreshUser();
        router.push('/auth/login');
      } else {
        message.error(result.error || '退出失败');
      }
    } catch (error) {
      message.error('退出失败，请稍后重试');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '概览',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品及其评论的管理',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {collapsed ? '管理' : '管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              {collapsed ? '☰' : '✕'}
            </button>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              管理后台系统
            </h1>
          </div>
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.email || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;