'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()
  const { refreshUser } = useAuth()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const result = await signIn(values.email, values.password)
      
      if (result.success) {
        message.success('登录成功！')
        await refreshUser()
        router.push('/')
      } else {
        message.error(result.error || '登录失败')
      }
    } catch (error) {
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="text-gray-900">
              用户登录
            </Title>
            <Text type="secondary">
              请输入您的邮箱和密码
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱！' },
                { type: 'email', message: '请输入有效的邮箱地址！' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6位字符！' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text type="secondary">
                还没有账户？
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                  立即注册
                </Link>
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}