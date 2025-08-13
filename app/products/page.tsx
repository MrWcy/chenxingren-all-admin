'use client';

import AdminLayout from '../components/AdminLayout';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Rate, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  message, 
  Popconfirm,
  Drawer,
  Tabs,
  Image,
  Avatar,
  Tooltip,
  List,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  UploadOutlined,
  SettingOutlined,
  MessageOutlined,
  SearchOutlined,
  CloseOutlined,
  DragOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// 规格配置接口定义
interface SpecConfig {
  specs: SpecItem[];
}

interface SpecItem {
  key: string;
  name: string;
  values: string[];
  sort: number;
}

// 商品接口定义
interface Product {
  id: number;
  name: string;
  brand?: string;
  description?: string;
  mainImage?: string;
  detailImages?: string[];
  specInfo?: any;
  basePrice: string;
  status: number;
  sortOrder: number;
  salesCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  specConfig?: SpecConfig;
}

// SKU接口定义
interface ProductSku {
  id: number;
  productId: number;
  skuCode: string;
  skuName?: string;
  specValues?: any;
  imageUrl?: string;
  price: string;
  originalPrice?: string;
  costPrice?: string;
  stock: number;
  weight?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 评论接口定义
interface ProductReview {
  id: number;
  orderItemId: number;
  userId: number;
  productId: number;
  skuId: number;
  rating: number;
  content?: string;
  images?: string[];
  replyContent?: string;
  replyTime?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  userNickname?: string;
  userAvatarUrl?: string;
}
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  
  // 商品编辑相关状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productForm] = Form.useForm();
  
  // SKU管理相关状态
  const [skuDrawerVisible, setSkuDrawerVisible] = useState(false);
  const [skuList, setSkuList] = useState<ProductSku[]>([]);
  const [skuModalVisible, setSkuModalVisible] = useState(false);
  const [currentSku, setCurrentSku] = useState<ProductSku | null>(null);
  const [skuForm] = Form.useForm();
  
  // 评论管理相关状态
  const [reviewDrawerVisible, setReviewDrawerVisible] = useState(false);
  const [reviewList, setReviewList] = useState<ProductReview[]>([]);
  const [reviewPagination, setReviewPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
   const [currentReview, setCurrentReview] = useState<ProductReview | null>(null);
   const [replyForm] = Form.useForm();

  // 规格配置相关状态
  const [specConfigModalVisible, setSpecConfigModalVisible] = useState(false);
  const [currentSpecConfig, setCurrentSpecConfig] = useState<SpecConfig>({ specs: [] });
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [newDetailImageUrl, setNewDetailImageUrl] = useState('');

   // 加载商品列表
   const loadProducts = async (page = 1, pageSize = 10) => {
     setLoading(true);
     try {
       const params = new URLSearchParams({
         page: page.toString(),
         pageSize: pageSize.toString(),
         ...(searchText && { search: searchText }),
         ...(statusFilter !== undefined && { status: statusFilter.toString() })
       });
       
       const response = await fetch(`/api/products?${params}`);
       const result = await response.json();
       
       if (result.success) {
         setProducts(result.data.list);
         setPagination({
           current: result.data.page,
           pageSize: result.data.pageSize,
           total: result.data.total
         });
       } else {
         message.error(result.message || '加载商品列表失败');
       }
     } catch (error) {
       message.error('加载商品列表失败');
     } finally {
       setLoading(false);
     }
   };

   // 删除商品
   const handleDeleteProduct = async (id: number) => {
     try {
       const response = await fetch(`/api/products?id=${id}`, {
         method: 'DELETE'
       });
       const result = await response.json();
       
       if (result.success) {
         message.success('删除成功');
         loadProducts(pagination.current, pagination.pageSize);
       } else {
         message.error(result.message || '删除失败');
       }
     } catch (error) {
       message.error('删除失败');
     }
   };

   // 保存商品
   const handleSaveProduct = async (values: any) => {
     try {
       // 验证规格配置
       if (currentSpecConfig.specs.length > 0 && !validateSpecConfig()) {
         return;
       }
       
       const isEdit = !!currentProduct;
       const url = '/api/products';
       const method = isEdit ? 'PUT' : 'POST';
       const data = isEdit ? { 
         id: currentProduct.id, 
         ...values, 
         detailImages,
         specConfig: currentSpecConfig.specs.length > 0 ? currentSpecConfig : null
       } : { 
         ...values, 
         detailImages,
         specConfig: currentSpecConfig.specs.length > 0 ? currentSpecConfig : null
       };
       
       const response = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       const result = await response.json();
       
       if (result.success) {
         message.success(isEdit ? '更新成功' : '创建成功');
         setEditModalVisible(false);
         productForm.resetFields();
         setCurrentProduct(null);
         setDetailImages([]);
         setCurrentSpecConfig({ specs: [] });
         loadProducts(pagination.current, pagination.pageSize);
       } else {
         message.error(result.message || '保存失败');
       }
     } catch (error) {
       console.error('保存商品失败:', error);
       message.error('保存失败');
     }
   };

   // 打开商品编辑弹窗
   const handleEditProduct = (product?: Product) => {
     setCurrentProduct(product || null);
     if (product) {
       productForm.setFieldsValue(product);
       setDetailImages(product.detailImages || []);
       setCurrentSpecConfig(product.specConfig || { specs: [] });
     } else {
       productForm.resetFields();
       setDetailImages([]);
       setCurrentSpecConfig({ specs: [] });
     }
     setEditModalVisible(true);
   };

   // 添加详情图片
   const handleAddDetailImage = () => {
     if (newDetailImageUrl.trim()) {
       // 检查URL是否已存在
       if (detailImages.includes(newDetailImageUrl.trim())) {
         message.warning('该图片URL已存在');
         return;
       }
       setDetailImages([...detailImages, newDetailImageUrl.trim()]);
       setNewDetailImageUrl('');
       message.success('图片添加成功');
     } else {
       message.warning('请输入有效的图片URL');
     }
   };

   // 删除详情图片
   const handleRemoveDetailImage = (index: number) => {
     setDetailImages(detailImages.filter((_, i) => i !== index));
     message.success('图片删除成功');
   };

   // 批量添加详情图片
   const handleBatchAddDetailImages = (urls: string) => {
     const urlList = urls.split('\n').map(url => url.trim()).filter(url => url);
     const newUrls = urlList.filter(url => !detailImages.includes(url));
     if (newUrls.length > 0) {
       setDetailImages([...detailImages, ...newUrls]);
       message.success(`成功添加 ${newUrls.length} 张图片`);
     } else {
       message.warning('没有新的图片URL可添加');
     }
   };

   // 移动详情图片位置
   const handleMoveDetailImage = (fromIndex: number, toIndex: number) => {
     const newImages = [...detailImages];
     const [movedImage] = newImages.splice(fromIndex, 1);
     newImages.splice(toIndex, 0, movedImage);
     setDetailImages(newImages);
   };

   // 添加规格项
   const handleAddSpecItem = () => {
     const newSpec: SpecItem = {
       key: '',
       name: '',
       values: [],
       sort: currentSpecConfig.specs.length + 1
     };
     setCurrentSpecConfig({
       specs: [...currentSpecConfig.specs, newSpec]
     });
     message.success('规格项添加成功');
   };

   // 更新规格项
   const handleUpdateSpecItem = (index: number, field: keyof SpecItem, value: any) => {
     const updatedSpecs = [...currentSpecConfig.specs];
     
     // 验证规格标识的唯一性
     if (field === 'key' && value) {
       const existingKeys = updatedSpecs.filter((_, i) => i !== index).map(spec => spec.key);
       if (existingKeys.includes(value)) {
         message.error('规格标识已存在，请使用其他标识');
         return;
       }
     }
     
     updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
     setCurrentSpecConfig({ specs: updatedSpecs });
   };

   // 删除规格项
   const handleRemoveSpecItem = (index: number) => {
     const updatedSpecs = currentSpecConfig.specs.filter((_, i) => i !== index);
     // 重新排序
     updatedSpecs.forEach((spec, i) => {
       spec.sort = i + 1;
     });
     setCurrentSpecConfig({ specs: updatedSpecs });
     message.success('规格项删除成功');
   };

   // 添加规格值
   const handleAddSpecValue = (specIndex: number, value: string) => {
     if (value.trim()) {
       const updatedSpecs = [...currentSpecConfig.specs];
       const currentValues = updatedSpecs[specIndex].values;
       
       // 检查规格值是否已存在
       if (currentValues.includes(value.trim())) {
         message.warning('该规格值已存在');
         return;
       }
       
       updatedSpecs[specIndex].values = [...currentValues, value.trim()];
       setCurrentSpecConfig({ specs: updatedSpecs });
       message.success('规格值添加成功');
     }
   };

   // 删除规格值
   const handleRemoveSpecValue = (specIndex: number, valueIndex: number) => {
     const updatedSpecs = [...currentSpecConfig.specs];
     updatedSpecs[specIndex].values = updatedSpecs[specIndex].values.filter((_, i) => i !== valueIndex);
     setCurrentSpecConfig({ specs: updatedSpecs });
   };

   // 移动规格项位置
   const handleMoveSpecItem = (fromIndex: number, toIndex: number) => {
     const updatedSpecs = [...currentSpecConfig.specs];
     const [movedSpec] = updatedSpecs.splice(fromIndex, 1);
     updatedSpecs.splice(toIndex, 0, movedSpec);
     
     // 更新排序
     updatedSpecs.forEach((spec, index) => {
       spec.sort = index + 1;
     });
     
     setCurrentSpecConfig({ specs: updatedSpecs });
   };

   // 验证规格配置
   const validateSpecConfig = () => {
     for (const spec of currentSpecConfig.specs) {
       if (!spec.key.trim()) {
         message.error('请填写所有规格的标识');
         return false;
       }
       if (!spec.name.trim()) {
         message.error('请填写所有规格的名称');
         return false;
       }
       if (spec.values.length === 0) {
         message.error(`规格"${spec.name}"至少需要一个规格值`);
         return false;
       }
     }
     return true;
   };

   // 打开规格配置弹窗
   const handleOpenSpecConfig = () => {
     setSpecConfigModalVisible(true);
   };

   // 加载SKU列表
   const loadSkuList = async (productId: number) => {
     try {
       const response = await fetch(`/api/products/${productId}/skus`);
       const result = await response.json();
       
       if (result.success) {
         setSkuList(result.data);
       } else {
         message.error(result.message || '加载SKU列表失败');
       }
     } catch (error) {
       message.error('加载SKU列表失败');
     }
   };

   // 打开SKU管理抽屉
   const handleManageSkus = (product: Product) => {
     setCurrentProduct(product);
     setSkuDrawerVisible(true);
     loadSkuList(product.id);
   };

   // 保存SKU
   const handleSaveSku = async (values: any) => {
     if (!currentProduct) return;
     
     try {
       const isEdit = !!currentSku;
       const url = `/api/products/${currentProduct.id}/skus`;
       const method = isEdit ? 'PUT' : 'POST';
       const data = isEdit ? { skuId: currentSku.id, ...values } : values;
       
       const response = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       const result = await response.json();
       
       if (result.success) {
         message.success(isEdit ? 'SKU更新成功' : 'SKU创建成功');
         setSkuModalVisible(false);
         skuForm.resetFields();
         setCurrentSku(null);
         loadSkuList(currentProduct.id);
       } else {
         message.error(result.message || 'SKU保存失败');
       }
     } catch (error) {
       message.error('SKU保存失败');
     }
   };

   // 删除SKU
   const handleDeleteSku = async (skuId: number) => {
     if (!currentProduct) return;
     
     try {
       const response = await fetch(`/api/products/${currentProduct.id}/skus?skuId=${skuId}`, {
         method: 'DELETE'
       });
       const result = await response.json();
       
       if (result.success) {
         message.success('SKU删除成功');
         loadSkuList(currentProduct.id);
       } else {
         message.error(result.message || 'SKU删除失败');
       }
     } catch (error) {
       message.error('SKU删除失败');
     }
   };

   // 加载评论列表
   const loadReviewList = async (productId: number, page = 1, pageSize = 10) => {
     try {
       const params = new URLSearchParams({
         page: page.toString(),
         pageSize: pageSize.toString()
       });
       
       const response = await fetch(`/api/products/${productId}/reviews?${params}`);
       const result = await response.json();
       
       if (result.success) {
         setReviewList(result.data.list);
         setReviewPagination({
           current: result.data.page,
           pageSize: result.data.pageSize,
           total: result.data.total
         });
       } else {
         message.error(result.message || '加载评论列表失败');
       }
     } catch (error) {
       message.error('加载评论列表失败');
     }
   };

   // 打开评论管理抽屉
   const handleManageReviews = (product: Product) => {
     setCurrentProduct(product);
     setReviewDrawerVisible(true);
     loadReviewList(product.id);
   };

   // 回复评论
   const handleReplyReview = async (values: any) => {
     if (!currentProduct || !currentReview) return;
     
     try {
       const response = await fetch(`/api/products/${currentProduct.id}/reviews`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           reviewId: currentReview.id,
           replyContent: values.replyContent
         })
       });
       const result = await response.json();
       
       if (result.success) {
         message.success('回复成功');
         setReplyModalVisible(false);
         replyForm.resetFields();
         setCurrentReview(null);
         loadReviewList(currentProduct.id, reviewPagination.current, reviewPagination.pageSize);
       } else {
         message.error(result.message || '回复失败');
       }
     } catch (error) {
       message.error('回复失败');
     }
   };

   // 更新评论状态
   const handleUpdateReviewStatus = async (reviewId: number, status: number) => {
     if (!currentProduct) return;
     
     try {
       const response = await fetch(`/api/products/${currentProduct.id}/reviews`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ reviewId, status })
       });
       const result = await response.json();
       
       if (result.success) {
         message.success('状态更新成功');
         loadReviewList(currentProduct.id, reviewPagination.current, reviewPagination.pageSize);
       } else {
         message.error(result.message || '状态更新失败');
       }
     } catch (error) {
       message.error('状态更新失败');
     }
   };

   // 页面加载时获取数据
   useEffect(() => {
     loadProducts();
   }, []);

   // 搜索和筛选变化时重新加载
   useEffect(() => {
     loadProducts(1, pagination.pageSize);
   }, [searchText, statusFilter]);

   // 商品表格列定义
    const productColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: '商品图片',
        dataIndex: 'mainImage',
        key: 'mainImage',
        width: 100,
        render: (mainImage: string) => (
          mainImage ? (
            <Image
              src={mainImage}
              alt="商品图片"
              width={60}
              height={60}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 60, height: 60, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              暂无图片
            </div>
          )
        ),
      },
      {
        title: '详情图片',
        dataIndex: 'detailImages',
        key: 'detailImages',
        width: 120,
        render: (detailImages: string[]) => (
          <div>
            {detailImages && detailImages.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {detailImages.slice(0, 3).map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`详情图片${index + 1}`}
                    width={20}
                    height={20}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
                {detailImages.length > 3 && (
                  <div style={{ 
                    width: 20, 
                    height: 20, 
                    background: '#f0f0f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>
                    +{detailImages.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: '#999', fontSize: '12px' }}>无</span>
            )}
          </div>
        ),
      },
      {
        title: '规格配置',
        dataIndex: 'specConfig',
        key: 'specConfig',
        width: 150,
        render: (specConfig: SpecConfig) => (
          <div>
            {specConfig && specConfig.specs && specConfig.specs.length > 0 ? (
              <div>
                {specConfig.specs.map((spec, index) => (
                  <Tag key={index} size="small" style={{ marginBottom: 2 }}>
                    {spec.name}({spec.values.length})
                  </Tag>
                ))}
              </div>
            ) : (
              <span style={{ color: '#999', fontSize: '12px' }}>未配置</span>
            )}
          </div>
        ),
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        key: 'brand',
        width: 120,
      },
      {
        title: '基础价格',
        dataIndex: 'basePrice',
        key: 'basePrice',
        width: 120,
        render: (price: string) => `¥${parseFloat(price).toFixed(2)}`,
      },
      {
        title: '销量',
        dataIndex: 'salesCount',
        key: 'salesCount',
        width: 80,
      },
      {
        title: '浏览量',
        dataIndex: 'viewCount',
        key: 'viewCount',
        width: 80,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: number) => (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? '上架' : '下架'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (_, record: Product) => (
          <Space size="small">
            <Tooltip title="编辑商品">
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(record)}
              />
            </Tooltip>
            <Tooltip title="SKU管理">
              <Button
                size="small"
                icon={<SettingOutlined />}
                onClick={() => handleManageSkus(record)}
              />
            </Tooltip>
            <Tooltip title="评论管理">
              <Button
                size="small"
                icon={<MessageOutlined />}
                onClick={() => handleManageReviews(record)}
              />
            </Tooltip>
            <Popconfirm
              title="确定要删除这个商品吗？"
              onConfirm={() => handleDeleteProduct(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除商品">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    // SKU表格列定义
    const skuColumns = [
      {
        title: 'SKU编码',
        dataIndex: 'skuCode',
        key: 'skuCode',
        width: 120,
      },
      {
        title: 'SKU名称',
        dataIndex: 'skuName',
        key: 'skuName',
        width: 150,
      },
      {
        title: '规格',
        dataIndex: 'specValues',
        key: 'specValues',
        width: 200,
        render: (specValues: any) => {
          if (!specValues || typeof specValues !== 'object') return '-';
          return (
            <div>
              {Object.entries(specValues).map(([key, value], index) => {
                const specName = currentProduct?.specConfig?.specs.find(s => s.key === key)?.name || key;
                return (
                  <Tag key={index} style={{ marginBottom: 2 }}>
                    {specName}: {value as string}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 100,
        render: (price: string) => `¥${parseFloat(price).toFixed(2)}`,
      },
      {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock',
        width: 80,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status: number) => (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? '启用' : '禁用'}
          </Tag>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record: ProductSku) => (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setCurrentSku(record);
                skuForm.setFieldsValue(record);
                setSkuModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个SKU吗？"
              onConfirm={() => handleDeleteSku(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button danger size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    // 评论表格列定义
    const reviewColumns = [
      {
        title: '用户',
        key: 'user',
        width: 120,
        render: (_, record: ProductReview) => (
          <Space>
            <Avatar src={record.userAvatarUrl} size="small">
              {record.userNickname?.charAt(0)}
            </Avatar>
            <span>{record.userNickname || '匿名用户'}</span>
          </Space>
        ),
      },
      {
        title: '评分',
        dataIndex: 'rating',
        key: 'rating',
        width: 120,
        render: (rating: number) => <Rate disabled value={rating} />,
      },
      {
        title: '评论内容',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
      },
      {
        title: '回复内容',
        dataIndex: 'replyContent',
        key: 'replyContent',
        ellipsis: true,
        render: (replyContent: string) => replyContent || '暂未回复',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: number) => {
          const statusMap = {
            1: { text: '已审核', color: 'green' },
            0: { text: '待审核', color: 'orange' },
            2: { text: '已拒绝', color: 'red' }
          };
          const statusInfo = statusMap[status as keyof typeof statusMap] || { text: '未知', color: 'default' };
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
        },
      },
      {
        title: '评论时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (_, record: ProductReview) => (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setCurrentReview(record);
                replyForm.setFieldsValue({ replyContent: record.replyContent || '' });
                setReplyModalVisible(true);
              }}
            >
              回复
            </Button>
            <Select
              size="small"
              value={record.status}
              style={{ width: 80 }}
              onChange={(value) => handleUpdateReviewStatus(record.id, value)}
            >
              <Option value={1}>通过</Option>
              <Option value={0}>待审</Option>
              <Option value={2}>拒绝</Option>
            </Select>
          </Space>
        ),
      },
    ];

   return (
     <AdminLayout>
       <div style={{ padding: '24px' }}>
         <Card>
           <div style={{ marginBottom: 16 }}>
             <Space style={{ marginBottom: 16 }}>
               <Input
                 placeholder="搜索商品名称"
                 prefix={<SearchOutlined />}
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                 style={{ width: 200 }}
                 allowClear
               />
               <Select
                 placeholder="选择状态"
                 value={statusFilter}
                 onChange={setStatusFilter}
                 style={{ width: 120 }}
                 allowClear
               >
                 <Option value={1}>上架</Option>
                 <Option value={0}>下架</Option>
               </Select>
               <Button
                 type="primary"
                 icon={<PlusOutlined />}
                 onClick={() => handleEditProduct()}
               >
                 新增商品
               </Button>
             </Space>
           </div>
           
           <Table
             columns={productColumns}
             dataSource={products}
             rowKey="id"
             loading={loading}
             pagination={{
               current: pagination.current,
               pageSize: pagination.pageSize,
               total: pagination.total,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
               onChange: (page, pageSize) => {
                 loadProducts(page, pageSize);
               },
             }}
             scroll={{ x: 1200 }}
           />
         </Card>

         {/* 商品编辑弹窗 */}
         <Modal
           title={currentProduct ? '编辑商品' : '新增商品'}
           open={editModalVisible}
           onCancel={() => {
             setEditModalVisible(false);
             setCurrentProduct(null);
             productForm.resetFields();
             setDetailImages([]);
             setCurrentSpecConfig({ specs: [] });
           }}
           footer={null}
           width={800}
         >
           <Form
             form={productForm}
             layout="vertical"
             onFinish={handleSaveProduct}
           >
             <Form.Item
               name="name"
               label="商品名称"
               rules={[{ required: true, message: '请输入商品名称' }]}
             >
               <Input placeholder="请输入商品名称" />
             </Form.Item>
             
             <Form.Item
               name="brand"
               label="品牌"
             >
               <Input placeholder="请输入品牌" />
             </Form.Item>
             
             <Form.Item
               name="description"
               label="商品描述"
             >
               <TextArea rows={4} placeholder="请输入商品描述" />
             </Form.Item>
             
             <Form.Item
               name="mainImage"
               label="主图URL"
             >
               <Input placeholder="请输入主图URL" />
             </Form.Item>
             
             {/* 详情图片管理 */}
             <Form.Item label="详情图片">
               <div>
                 <Tabs defaultActiveKey="single" size="small" style={{ marginBottom: 16 }}>
                   <TabPane tab="单个添加" key="single">
                     <Space style={{ marginBottom: 8 }}>
                       <Input
                         placeholder="请输入图片URL"
                         value={newDetailImageUrl}
                         onChange={(e) => setNewDetailImageUrl(e.target.value)}
                         style={{ width: 300 }}
                         onPressEnter={handleAddDetailImage}
                       />
                       <Button type="primary" onClick={handleAddDetailImage}>
                         添加图片
                       </Button>
                     </Space>
                   </TabPane>
                   <TabPane tab="批量添加" key="batch">
                     <TextArea
                       placeholder="请输入图片URL，每行一个"
                       rows={4}
                       style={{ marginBottom: 8 }}
                       onPressEnter={(e) => {
                         if (e.ctrlKey || e.metaKey) {
                           handleBatchAddDetailImages((e.target as HTMLTextAreaElement).value);
                           (e.target as HTMLTextAreaElement).value = '';
                         }
                       }}
                     />
                     <Button 
                       type="primary" 
                       onClick={(e) => {
                         const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                         if (textarea) {
                           handleBatchAddDetailImages(textarea.value);
                           textarea.value = '';
                         }
                       }}
                     >
                       批量添加
                     </Button>
                   </TabPane>
                 </Tabs>
                 
                 {detailImages.length > 0 && (
                   <div>
                     <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                       已添加 {detailImages.length} 张图片，可拖拽调整顺序
                     </div>
                     <List
                       size="small"
                       bordered
                       dataSource={detailImages}
                       renderItem={(item, index) => (
                         <List.Item
                           style={{ cursor: 'move' }}
                           actions={[
                             <Button
                               key="up"
                               type="text"
                               size="small"
                               disabled={index === 0}
                               onClick={() => handleMoveDetailImage(index, index - 1)}
                             >
                               ↑
                             </Button>,
                             <Button
                               key="down"
                               type="text"
                               size="small"
                               disabled={index === detailImages.length - 1}
                               onClick={() => handleMoveDetailImage(index, index + 1)}
                             >
                               ↓
                             </Button>,
                             <Button
                               key="delete"
                               type="text"
                               danger
                               size="small"
                               icon={<CloseOutlined />}
                               onClick={() => handleRemoveDetailImage(index)}
                             />
                           ]}
                         >
                           <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                             <DragOutlined style={{ marginRight: 8, color: '#999' }} />
                             <span style={{ marginRight: 8, fontSize: '12px', color: '#999', minWidth: 20 }}>
                               {index + 1}.
                             </span>
                             <Image
                               src={item}
                               alt={`详情图片${index + 1}`}
                               width={50}
                               height={50}
                               style={{ marginRight: 8, objectFit: 'cover' }}
                               fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                             />
                             <div style={{ flex: 1, minWidth: 0 }}>
                               <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                                 {item.length > 60 ? `${item.substring(0, 60)}...` : item}
                               </div>
                             </div>
                           </div>
                         </List.Item>
                       )}
                     />
                   </div>
                 )}
               </div>
             </Form.Item>
             
             {/* 规格配置 */}
             <Form.Item label="规格配置">
               <div>
                 <Button type="dashed" onClick={handleOpenSpecConfig} style={{ marginBottom: 8 }}>
                   <SettingOutlined /> 配置商品规格
                 </Button>
                 {currentSpecConfig.specs.length > 0 && (
                   <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                     <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>已配置规格：</div>
                     {currentSpecConfig.specs.map((spec, index) => (
                       <Tag key={index} style={{ marginBottom: 4 }}>
                         {spec.name}: {spec.values.join(', ')}
                       </Tag>
                     ))}
                   </div>
                 )}
               </div>
             </Form.Item>
             
             <Form.Item
               name="basePrice"
               label="基础价格"
               rules={[{ required: true, message: '请输入基础价格' }]}
             >
               <InputNumber
                 min={0}
                 precision={2}
                 style={{ width: '100%' }}
                 placeholder="请输入基础价格"
               />
             </Form.Item>
             
             <Form.Item
               name="status"
               label="状态"
               initialValue={1}
             >
               <Select>
                 <Option value={1}>上架</Option>
                 <Option value={0}>下架</Option>
               </Select>
             </Form.Item>
             
             <Form.Item
               name="sortOrder"
               label="排序"
               initialValue={0}
             >
               <InputNumber
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="请输入排序值"
               />
             </Form.Item>
             
             <Form.Item>
               <Space>
                 <Button type="primary" htmlType="submit">
                   保存
                 </Button>
                 <Button onClick={() => {
                   setEditModalVisible(false);
                   setCurrentProduct(null);
                   productForm.resetFields();
                   setDetailImages([]);
                   setCurrentSpecConfig({ specs: [] });
                 }}>
                   取消
                 </Button>
               </Space>
             </Form.Item>
           </Form>
         </Modal>

         {/* SKU管理抽屉 */}
         <Drawer
           title={`SKU管理 - ${currentProduct?.name}`}
           placement="right"
           width={800}
           open={skuDrawerVisible}
           onClose={() => {
             setSkuDrawerVisible(false);
             setCurrentProduct(null);
             setSkuList([]);
           }}
         >
           <div style={{ marginBottom: 16 }}>
             <Button
               type="primary"
               icon={<PlusOutlined />}
               onClick={() => {
                 setCurrentSku(null);
                 skuForm.resetFields();
                 setSkuModalVisible(true);
               }}
             >
               新增SKU
             </Button>
           </div>
           
           <Table
             columns={skuColumns}
             dataSource={skuList}
             rowKey="id"
             pagination={false}
             size="small"
             scroll={{ x: 800 }}
           />
         </Drawer>

         {/* SKU编辑弹窗 */}
         <Modal
           title={currentSku ? '编辑SKU' : '新增SKU'}
           open={skuModalVisible}
           onCancel={() => {
             setSkuModalVisible(false);
             setCurrentSku(null);
             skuForm.resetFields();
           }}
           footer={null}
           width={700}
         >
           <Form
             form={skuForm}
             layout="vertical"
             onFinish={handleSaveSku}
           >
             <Form.Item
               name="skuCode"
               label="SKU编码"
               rules={[{ required: true, message: '请输入SKU编码' }]}
             >
               <Input placeholder="请输入SKU编码" />
             </Form.Item>
             
             <Form.Item
               name="skuName"
               label="SKU名称"
             >
               <Input placeholder="请输入SKU名称" />
             </Form.Item>
             
             {/* 规格值选择 */}
             {currentProduct?.specConfig?.specs && currentProduct.specConfig.specs.length > 0 && (
               <Form.Item label="规格选择">
                 <div>
                   {currentProduct.specConfig.specs.map((spec, index) => (
                     <div key={index} style={{ marginBottom: 12 }}>
                       <div style={{ marginBottom: 4, fontSize: '14px', fontWeight: 500 }}>
                         {spec.name}:
                       </div>
                       <Select
                         placeholder={`请选择${spec.name}`}
                         style={{ width: '100%' }}
                         value={currentSku?.specValues?.[spec.key]}
                         onChange={(value) => {
                           const currentSpecValues = skuForm.getFieldValue('specValues') || {};
                           const newSpecValues = { ...currentSpecValues, [spec.key]: value };
                           skuForm.setFieldsValue({ specValues: newSpecValues });
                         }}
                       >
                         {spec.values.map((value, valueIndex) => (
                           <Option key={valueIndex} value={value}>
                             {value}
                           </Option>
                         ))}
                       </Select>
                     </div>
                   ))}
                 </div>
               </Form.Item>
             )}
             
             <Form.Item name="specValues" hidden>
               <Input />
             </Form.Item>
             
             <Form.Item
               name="price"
               label="价格"
               rules={[{ required: true, message: '请输入价格' }]}
             >
               <InputNumber
                 min={0}
                 precision={2}
                 style={{ width: '100%' }}
                 placeholder="请输入价格"
               />
             </Form.Item>
             
             <Form.Item
               name="originalPrice"
               label="原价"
             >
               <InputNumber
                 min={0}
                 precision={2}
                 style={{ width: '100%' }}
                 placeholder="请输入原价"
               />
             </Form.Item>
             
             <Form.Item
               name="costPrice"
               label="成本价"
             >
               <InputNumber
                 min={0}
                 precision={2}
                 style={{ width: '100%' }}
                 placeholder="请输入成本价"
               />
             </Form.Item>
             
             <Form.Item
               name="stock"
               label="库存"
               initialValue={0}
             >
               <InputNumber
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="请输入库存"
               />
             </Form.Item>
             
             <Form.Item
               name="imageUrl"
               label="SKU图片URL"
             >
               <Input placeholder="请输入SKU图片URL" />
             </Form.Item>
             
             <Form.Item
               name="status"
               label="状态"
               initialValue={1}
             >
               <Select>
                 <Option value={1}>启用</Option>
                 <Option value={0}>禁用</Option>
               </Select>
             </Form.Item>
             
             <Form.Item>
               <Space>
                 <Button type="primary" htmlType="submit">
                   保存
                 </Button>
                 <Button onClick={() => {
                   setSkuModalVisible(false);
                   setCurrentSku(null);
                   skuForm.resetFields();
                 }}>
                   取消
                 </Button>
               </Space>
             </Form.Item>
           </Form>
         </Modal>

         {/* 评论管理抽屉 */}
         <Drawer
           title={`评论管理 - ${currentProduct?.name}`}
           placement="right"
           width={1000}
           open={reviewDrawerVisible}
           onClose={() => {
             setReviewDrawerVisible(false);
             setCurrentProduct(null);
             setReviewList([]);
           }}
         >
           <Table
             columns={reviewColumns}
             dataSource={reviewList}
             rowKey="id"
             pagination={{
               current: reviewPagination.current,
               pageSize: reviewPagination.pageSize,
               total: reviewPagination.total,
               showSizeChanger: true,
               showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
               onChange: (page, pageSize) => {
                 if (currentProduct) {
                   loadReviewList(currentProduct.id, page, pageSize);
                 }
               },
             }}
             size="small"
           />
         </Drawer>

         {/* 回复评论弹窗 */}
         <Modal
           title="回复评论"
           open={replyModalVisible}
           onCancel={() => {
             setReplyModalVisible(false);
             setCurrentReview(null);
             replyForm.resetFields();
           }}
           footer={null}
           width={600}
         >
           {currentReview && (
             <div style={{ marginBottom: 16 }}>
               <div style={{ marginBottom: 8 }}>
                 <strong>用户评论：</strong>
               </div>
               <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4, marginBottom: 16 }}>
                 <div style={{ marginBottom: 8 }}>
                   <Rate disabled value={currentReview.rating} />
                 </div>
                 <div>{currentReview.content}</div>
               </div>
             </div>
           )}
           
           <Form
             form={replyForm}
             layout="vertical"
             onFinish={handleReplyReview}
           >
             <Form.Item
               name="replyContent"
               label="回复内容"
               rules={[{ required: true, message: '请输入回复内容' }]}
             >
               <TextArea rows={4} placeholder="请输入回复内容" />
             </Form.Item>
             
             <Form.Item>
               <Space>
                 <Button type="primary" htmlType="submit">
                   回复
                 </Button>
                 <Button onClick={() => {
                   setReplyModalVisible(false);
                   setCurrentReview(null);
                   replyForm.resetFields();
                 }}>
                   取消
                 </Button>
               </Space>
             </Form.Item>
           </Form>
         </Modal>

         {/* 规格配置弹窗 */}
         <Modal
           title="规格配置"
           open={specConfigModalVisible}
           onCancel={() => setSpecConfigModalVisible(false)}
           footer={[
             <Button key="cancel" onClick={() => setSpecConfigModalVisible(false)}>
               取消
             </Button>,
             <Button 
               key="validate" 
               onClick={() => {
                 const validation = validateSpecConfig();
                 if (!validation.isValid) {
                   message.error(validation.message);
                   return;
                 }
                 message.success('规格配置验证通过');
               }}
             >
               验证配置
             </Button>,
             <Button 
               key="ok" 
               type="primary" 
               onClick={() => {
                 const validation = validateSpecConfig();
                 if (!validation.isValid) {
                   message.error(validation.message);
                   return;
                 }
                 setSpecConfigModalVisible(false);
               }}
             >
               确定
             </Button>
           ]}
           width={900}
         >
           <div>
             <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Button type="primary" onClick={handleAddSpecItem}>
                 <PlusOutlined /> 添加规格
               </Button>
               {currentSpecConfig.specs.length > 0 && (
                 <div style={{ fontSize: '12px', color: '#666' }}>
                   已配置 {currentSpecConfig.specs.length} 个规格项，共 {currentSpecConfig.specs.reduce((total, spec) => total + spec.values.length, 0)} 个规格值
                 </div>
               )}
             </div>
             
             {currentSpecConfig.specs.map((spec, specIndex) => (
               <Card 
                 key={specIndex} 
                 size="small" 
                 style={{ marginBottom: 16 }}
                 title={
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <span>
                       <DragOutlined style={{ marginRight: 8, color: '#999' }} />
                       规格项 {specIndex + 1}
                       {spec.name && ` - ${spec.name}`}
                     </span>
                     <Space>
                       <Button
                         size="small"
                         disabled={specIndex === 0}
                         onClick={() => handleMoveSpecItem(specIndex, specIndex - 1)}
                       >
                         ↑
                       </Button>
                       <Button
                         size="small"
                         disabled={specIndex === currentSpecConfig.specs.length - 1}
                         onClick={() => handleMoveSpecItem(specIndex, specIndex + 1)}
                       >
                         ↓
                       </Button>
                       <Button
                         size="small"
                         danger
                         onClick={() => handleRemoveSpecItem(specIndex)}
                         icon={<CloseOutlined />}
                       >
                         删除
                       </Button>
                     </Space>
                   </div>
                 }
               >
                 <div style={{ marginBottom: 12 }}>
                   <Row gutter={16}>
                     <Col span={10}>
                       <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>规格标识</div>
                       <Input
                         placeholder="规格标识(如: color)"
                         value={spec.key}
                         onChange={(e) => handleUpdateSpecItem(specIndex, 'key', e.target.value)}
                         status={!spec.key ? 'error' : undefined}
                       />
                     </Col>
                     <Col span={10}>
                       <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>规格名称</div>
                       <Input
                         placeholder="规格名称(如: 颜色)"
                         value={spec.name}
                         onChange={(e) => handleUpdateSpecItem(specIndex, 'name', e.target.value)}
                         status={!spec.name ? 'error' : undefined}
                       />
                     </Col>
                     <Col span={4}>
                       <div style={{ marginBottom: 4, fontSize: '12px', color: '#666' }}>排序</div>
                       <InputNumber
                         placeholder="排序"
                         value={spec.sort}
                         onChange={(value) => handleUpdateSpecItem(specIndex, 'sort', value || 1)}
                         style={{ width: '100%' }}
                         min={1}
                       />
                     </Col>
                   </Row>
                 </div>
                 
                 <div>
                   <div style={{ marginBottom: 8, fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                     <span>规格值 ({spec.values.length} 个)</span>
                     {spec.values.length === 0 && <span style={{ color: '#ff4d4f' }}>至少需要一个规格值</span>}
                   </div>
                   <div style={{ marginBottom: 8, minHeight: 32, border: '1px dashed #d9d9d9', borderRadius: 4, padding: 8 }}>
                     {spec.values.length > 0 ? (
                       spec.values.map((value, valueIndex) => (
                         <Tag
                           key={valueIndex}
                           closable
                           onClose={() => handleRemoveSpecValue(specIndex, valueIndex)}
                           style={{ marginBottom: 4, marginRight: 4 }}
                           color={valueIndex % 2 === 0 ? 'blue' : 'green'}
                         >
                           {value}
                         </Tag>
                       ))
                     ) : (
                       <div style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
                         暂无规格值，请添加
                       </div>
                     )}
                   </div>
                   <Input.Search
                     placeholder="输入规格值并按回车添加"
                     enterButton={<PlusOutlined />}
                     size="small"
                     onSearch={(value) => {
                       handleAddSpecValue(specIndex, value);
                       // 清空输入框
                       const input = document.querySelector(`input[placeholder="输入规格值并按回车添加"]`) as HTMLInputElement;
                       if (input) input.value = '';
                     }}
                     onPressEnter={(e) => {
                       const value = (e.target as HTMLInputElement).value.trim();
                       if (value) {
                         handleAddSpecValue(specIndex, value);
                         (e.target as HTMLInputElement).value = '';
                       }
                     }}
                   />
                 </div>
               </Card>
             ))}
             
             {currentSpecConfig.specs.length === 0 && (
               <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                 暂无规格配置，点击上方按钮添加规格
               </div>
             )}
           </div>
         </Modal>
       </div>
     </AdminLayout>
   );
 }