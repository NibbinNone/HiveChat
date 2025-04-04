import React, { useState, useEffect, memo, useMemo } from 'react';
import { Message } from '@/app/db/schema';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Tooltip, message, Alert, Avatar, Popconfirm, Image as AntdImage } from "antd";
import { CopyOutlined, SyncOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import useModelListStore from '@/app/store/modelList';
import ThinkingIcon from '@/app/images/thinking.svg';
import MarkdownRender from '@/app/components/Markdown';
import { useTranslations } from 'next-intl';

const MessageItem = memo((props: {
  item: Message,
  index: number,
  role: 'assistant' | 'user' | 'system',
  retryMessage: (index: number) => void,
  deleteMessage: (index: number) => void
}
) => {
  const t = useTranslations('Chat');
  const { allProviderListByKey } = useModelListStore();
  const [messageApi, contextHolderMessage] = message.useMessage();
  const [images, setImages] = useState<string[]>([]);
  const [plainText, setPlainText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    if (Array.isArray(props.item.content) && props.item.content.length > 0) {
      const images = props.item.content.filter((item: any) => item.type === 'image').map((item: any) => item.data);
      setImages(images);
      const plainText = props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('')
      setPlainText(plainText);
    } else {
      setPlainText(props.item.content as string);
    }
  }, [props.item]);

  const ProviderAvatar = useMemo(() => {
    if (allProviderListByKey) {
      return (allProviderListByKey && allProviderListByKey[props.item.providerId]?.providerLogo) ? <Avatar
        style={{ marginTop: '0.2rem', 'fontSize': '24px', 'border': '1px solid #eee', 'padding': '2px' }}
        src={allProviderListByKey![props.item.providerId].providerLogo}
      /> : <div className='bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8'>
        {allProviderListByKey && allProviderListByKey[props.item.providerId].providerName.charAt(0)}</div>
    }
    else {
      return <div className='bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8'>
        Bot</div>
    }
  }, [allProviderListByKey, props.item.providerId])

  if (props.item.type === 'error' && props.item.errorType === 'TimeoutError') {
    return (
      <div className="flex container mx-auto px-4 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          {ProviderAvatar}
          <div className='flex flex-col w-0 grow group max-w-80'>
            <Alert
              showIcon
              style={{ marginLeft: '0.75rem' }}
              message={t('apiTimeout')}
              type="warning"
            />
            <div className='invisible flex flex-row items-center ml-3 my-1 group-hover:visible'>
              <Tooltip title={t('deleteNotice')}>
                <Popconfirm
                  title={t('deleteNotice')}
                  description={t('currentMessageDelete')}
                  onConfirm={() => props.deleteMessage(props.index)}
                  okText={t('confirm')}
                  cancelText={t('cancel')}
                  placement='bottom'
                >
                  <Button type="text" size='small'>
                    <DeleteOutlined style={{ color: 'gray' }} />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (props.item.type === 'error' && props.item.errorType === 'OverQuotaError') {
    return (
      <div className="flex container mx-auto px-4 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          {ProviderAvatar}
          <div className='flex flex-col w-0 grow group' style={{ maxWidth: '28rem' }}>
            <Alert
              showIcon
              style={{ marginLeft: '0.75rem' }}
              message="超出本月使用限额。请次月再重试，或联系管理员增加额度。"
              type="warning"
            />
            <div className='invisible flex flex-row items-center ml-3 my-1 group-hover:visible'>
              <Tooltip title={t('deleteNotice')}>
                <Popconfirm
                  title={t('deleteNotice')}
                  description={t('currentMessageDelete')}
                  onConfirm={() => props.deleteMessage(props.index)}
                  okText={t('confirm')}
                  cancelText={t('cancel')}
                  placement='bottom'
                >
                  <Button type="text" size='small'>
                    <DeleteOutlined style={{ color: 'gray' }} />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (props.item.type === 'error' && props.item.errorType === 'InvalidAPIKeyError') {
    return (
      <div className="flex container mx-auto px-4 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          {ProviderAvatar}
          <div className='flex flex-col w-0 grow group max-w-96'>
            <Alert
              showIcon
              style={{ marginLeft: '0.75rem' }}
              message={t('apiKeyError')}
              type="warning"
            />
            <div className='invisible flex flex-row items-center ml-3 my-1 group-hover:visible'>
              <Tooltip title={t('deleteNotice')}>
                <Popconfirm
                  title={t('deleteNotice')}
                  description={t('currentMessageDelete')}
                  onConfirm={() => props.deleteMessage(props.index)}
                  okText={t('confirm')}
                  cancelText={t('cancel')}
                  placement='bottom'
                >
                  <Button type="text" size='small'>
                    <DeleteOutlined style={{ color: 'gray' }} />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>);
  }
  if (props.item.type === 'break') {
    return <div className="flex container mx-auto px-4 max-w-screen-md w-full flex-col justify-center items-center" >
      <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
        <div className="relative w-full my-6">
          {/* Horizontal lines */}
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>

          {/* Text container */}
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">{t('contextCleared')}</span>
          </div>
        </div>
      </div>
    </div>
  }
  if (props.role === 'user') {
    return <div className="flex container mx-auto pl-4 pr-2 max-w-screen-md w-full flex-col justify-center items-center" >
      <div className='items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row-reverse'>
        <div className='flex ml-10 flex-col items-end group'>
          {contextHolderMessage}
          <div className='flex flex-row gap-2 mb-2'>
            {images.length > 0 &&
              images.map((image, index) => {
                return (
                  <div key={index} className="flex flex-wrap gap-4">
                    <AntdImage alt=''
                      className='block border h-full w-full rounded-md object-cover cursor-pointer'
                      height={160}
                      src={image}
                      preview={{
                        mask: false
                      }}
                    />
                  </div>
                );
              })}
          </div>
          {typeof props.item.content === 'string' &&
            <div
              className='w-fit px-4 py-3 markdown-body !min-w-4 !bg-gray-100 text-base rounded-xl ml-10'
              style={{ maxWidth: '44rem' }}
            >
              <MarkdownRender content={props.item.content} />
            </div>}
          {Array.isArray(props.item.content) &&
            props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('') !== '' &&
            <div
              className='w-fit px-4 py-3 markdown-body !min-w-4 !bg-gray-100 text-base rounded-xl ml-10'
              style={{ maxWidth: '44rem' }}
            >
              <MarkdownRender content={props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('')} />
            </div>}
          <div className='invisible flex flex-row-reverse pr-1 mt-1 group-hover:visible'>
            <Tooltip title={t('delete')}>
              <Popconfirm
                title={t('deleteNotice')}
                description={t('currentMessageDelete')}
                onConfirm={() => props.deleteMessage(props.index)}
                okText={t('confirm')}
                cancelText={t('cancel')}
                placement='bottom'
              >
                <Button type="text" size='small'>
                  <DeleteOutlined style={{ color: 'gray' }} />
                </Button>
              </Popconfirm>
            </Tooltip>
            <Tooltip title={t('retry')}>
              <Button type="text" size='small'
                onClick={() => {
                  props.retryMessage(props.index)
                }}
              >
                <SyncOutlined style={{ color: 'gray' }} />
              </Button>
            </Tooltip>
            <CopyToClipboard text={plainText} onCopy={() => {
              messageApi.success(t('copySuccess'));
            }}>
              <Tooltip title={t('copy')}>
                <Button type="text" size='small'>
                  <CopyOutlined style={{ color: 'gray' }} />
                </Button>
              </Tooltip>
            </CopyToClipboard>
          </div>
        </div>
      </div>
    </div>;
  }
  if (props.role === 'assistant') {
    return (
      <div className="flex container mx-auto px-4 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          {contextHolderMessage}
          {ProviderAvatar}
          <div className='flex flex-col w-0 grow group'>
            <div className='px-3 py-2 ml-2  bg-gray-100  text-gray-600 w-full grow markdown-body answer-content rounded-xl'>

              {props.item.reasoninContent &&
                <details open={true} className='text-sm mt-1 mb-4'>
                  <summary
                    className='flex text-xs flex-row items-center hover:bg-gray-200 text-gray-800 bg-gray-100 rounded-md p-2'
                    style={{ display: 'flex' }}
                  >
                    <ThinkingIcon width={16} height={16} style={{ 'fontSize': '10px' }} />
                    <span className='ml-1'>{t('thought')}</span>
                    <DownOutlined
                      className='ml-auto mr-1'
                      style={{
                        color: '#999',
                        transform: ``,
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </summary>
                  <div className='border-l-2 border-gray-200 px-2 mt-2 leading-5 text-gray-400'>
                    <MarkdownRender content={props.item.reasoninContent as string} />
                  </div>
                </details>}
              <MarkdownRender content={props.item.content as string} />
              {
                props.item.mcpTools && props.item.mcpTools.map((mcp, index) => {
                  return <details open={false} key={index} className='flex flex-row bg-gray-100 hover:bg-slate-100 text-gray-800 rounded-md mb-3  border border-gray-200 text-sm'>

                    <summary
                      className='flex text-xs flex-row items-center rounded-md p-4'
                      style={{ display: 'flex' }}
                      onClick={() => { setIsOpen(!isOpen) }}
                    >
                      <span className='mr-2'>调用 {mcp.tool?.serverName} 的工具： {mcp.tool?.name}</span>
                      {
                        mcp.response.isError ?
                          <div><CloseCircleOutlined style={{ color: 'red' }} /><span className='ml-1 text-red-600'>调用失败</span></div>
                          : <div><CheckCircleOutlined style={{ color: 'green' }} /><span className='ml-1 text-green-700'>已完成</span></div>
                      }
                      <DownOutlined
                        className='ml-auto mr-1'
                        style={{
                          color: '#999',
                          transform: `rotate(${isOpen ? -90 : 0}deg)`,
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </summary>
                    <div className='p-4 pb-0 text-xs border-t'>
                      <span className='mb-2 font-medium'>输入参数</span>
                      <pre className='scrollbar-thin' style={{ marginTop: '6px' }}>{JSON.stringify(mcp.tool.inputSchema, null, 2)}</pre>
                      <span className='mb-2 font-medium'>调用返回</span>
                      <pre className='scrollbar-thin bg-white' style={{ marginTop: '6px' }}>{JSON.stringify(mcp.response, null, 2)}</pre>
                    </div>
                  </details>
                })
              }
            </div>
            <div className='invisible flex flex-row items-center pl-1 group-hover:visible'>
              <CopyToClipboard text={plainText} onCopy={() => {
                messageApi.success(t('copySuccess'));
              }}>
                <Tooltip title={t('copy')}>
                  <Button type="text" size='small'>
                    <CopyOutlined style={{ color: 'gray' }} />
                  </Button>
                </Tooltip>
              </CopyToClipboard>
              <Tooltip title={t('retry')}>
                <Button type="text" size='small'
                  onClick={() => {
                    props.retryMessage(props.index - 1)
                  }}
                >
                  <SyncOutlined style={{ color: 'gray' }} />
                </Button>
              </Tooltip>
              <Tooltip title={t('delete')}>
                <Popconfirm
                  title={t('deleteNotice')}
                  description={t('currentMessageDelete')}
                  onConfirm={() => props.deleteMessage(props.index)}
                  okText={t('confirm')}
                  cancelText={t('cancel')}
                  placement='bottom'
                >
                  <Button type="text" size='small'>
                    <DeleteOutlined style={{ color: 'gray' }} />
                  </Button>
                </Popconfirm>
              </Tooltip>
              {props.item.totalTokens && <>
                <span className='text-xs text-gray-500 ml-2'>Tokens:{props.item.totalTokens.toLocaleString()}</span>
                <span className='text-xs text-gray-500 ml-2'>↑{props.item.inputTokens?.toLocaleString()}</span>
                <span className='text-xs text-gray-500 ml-2'>↓{props.item.outputTokens?.toLocaleString()}</span>
              </>}
            </div>
          </div>
        </div>
      </div>
    )
  }
});

MessageItem.displayName = 'MessageItem';
export default MessageItem
