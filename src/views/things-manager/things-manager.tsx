import * as React from 'react';
import styles from './things-manager.module.css'
import { Input, Button, Modal, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
const { Search, TextArea } = Input;

class ThingsManager extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      visible: false,
      thingInputContent: '',
      dataSource: [],
      tableLoading: false,
      searchValue: ''
    }
  }
  componentDidMount() {
    this.getList()
  }
  size: SizeType = 'middle'
  title: string = ''
  thingInputRef: any = null
  page: any = {
    current: 1,
    pageSize: 10,
    total: 0
  }
  thingsList: any = []
  editingId: number = 0 // 编辑中的id
  columns: Array<Object> = [
    {
      title: '待办事项',
      dataIndex: 'thingContent',
      key: 'thingContent',
      width: '60%',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: '20%',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: '20%',
      render: (text: any, record: any) => (
        <span>
          <Button type="link" onClick={() => this.editThing(record)}>编辑</Button>
          <Button type="link" danger onClick={() => this.delData(record)}>删除</Button>
        </span>
      ),
    },
  ];

  /**
   * 搜索
   * @param value 关键词
   */
  onSearch = (value: string) => {
    console.log(`搜索的内容为: ${value}`)
    this.getList(value)
  }

  /**
   * 展示modal
   */
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  /**
   * confirm 保存事项
   * @param e 
   */
  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.setState({
      thingInputContent: ''
    })
    if (this.title === '编辑') {
      this.updata(this.editingId, this.state.thingInputContent)
    } else {
      this.addData(this.state.thingInputContent)
    }
  };

  /**
   * cancel
   * @param e 
   */
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  /**
   * 编辑事项
   */
  editThing = (record: any): any => {
    this.editingId = record.id
    console.log('编辑的id', this.editingId)
    this.setState({
      thingInputContent: record.thingContent
    })
    this.showModal()
    this.title = '编辑'
  }

  /**
   * 新增事项
   */
  newThing = () => {
    this.showModal()
    this.title = '新增'
  }

  /**
   * 输入框内容改变
   */
  thingInputContentChange = (e: any) => {
    this.setState({
      thingInputContent: e.target.value
    })
  }
  searchValueChange = (e: any) => {
    this.setState({
      searchValue: e.target.value
    })
  }

  /**
   * 获取当前时间
   */
  getNowDate(): string {
    const date = new Date();
    let month: string | number = date.getMonth() + 1;
    let days: string | number = date.getDate();
    let hours: string | number = date.getHours();
    let minutes: string | number = date.getMinutes();
    let seconds: string | number = date.getSeconds();
    if (month <= 9) {
      month = "0" + month;
    }
    if (days <= 9) {
      days = "0" + days;
    }
    if (hours <= 9) {
      hours = "0" + hours;
    }
    if (minutes <= 9) {
      minutes = "0" + minutes;
    }
    if (seconds <= 9) {
      seconds = "0" + seconds;
    }
    return date.getFullYear() + "-" + month + "-" + days + " "
      + hours + ":" + minutes + ":" + seconds
  }

  /**
   * 增加一条数据
   */
  addData = (thingContent: string) => {
    let thingsList: any = JSON.parse(localStorage.getItem('thingsList') || '{}')
    if (Array.isArray(thingsList.data) && thingsList.data.length >= 0) {
      thingsList.data.unshift({
        id: new Date().valueOf(),
        thingContent: thingContent,
        time: this.getNowDate()
      })
    } else {
      thingsList.data = [{
        thingContent: thingContent,
        id: new Date().valueOf(),
        time: this.getNowDate()
      }]
    }
    localStorage.setItem('thingsList', JSON.stringify(thingsList))
    this.getList()
  }

  /**
   * 更新一条数据
   */
  updata = (id: number, thingContent: string) => {
    this.addData(thingContent)
    this.delData({ id: id })
  }

  /**
   * 删除一条数据
   */
  delData = (record: any) => {
    const id = record.id
    console.log('要删除的id', record, id)
    const tempList = JSON.parse(JSON.stringify(this.thingsList))
    tempList.data.map((el: any, index: number) => {
      if (el.id == id) {
        this.thingsList.data.splice(index, 1)
        localStorage.setItem('thingsList', JSON.stringify(this.thingsList))
      }
    })
    this.getList()
  }

  /**
   * 获取数据列表
   */
  getList = (thingContent: string = '') => {
    const { current, pageSize } = this.page
    this.setState({
      tableLoading: true
    })
    let thingsList: any = JSON.parse(localStorage.getItem('thingsList') || '{}')
    this.thingsList = thingsList
    if (Array.isArray(thingsList.data) && thingsList.data.length >= 0) {
      // 模拟网络延迟
      setTimeout(() => {
        let tempList = JSON.parse(JSON.stringify(thingsList))
        if (thingContent !== '') {
          tempList.data = tempList.data.filter((el: any) => {
            return el.thingContent.includes(thingContent)
          })
        }
        this.setState({
          dataSource: tempList.data.slice((current - 1) * pageSize, current * pageSize),
          tableLoading: false,
        })
        this.page = {
          current: current,
          pageSize: pageSize,
          total: tempList.data.length
        }
        this.setState({
          searchValue: thingContent
        })
      }, 1000)
    } else {
      setTimeout(() => {
        this.setState({
          tableLoading: false,
        })
      }, 1000)
    }
  }

  /**
   * 翻页
   */
  onChange = (pagination: Object) => {
    this.page = pagination
    this.getList()
  }
  render = () => {
    return (
      <div>
        {/* navbar */}
        <div className='box'>
          <Search
            className={styles.search}
            placeholder='请输入要搜索的待办事项'
            allowClear
            enterButton='搜索'
            size={this.size}
            onSearch={this.onSearch}
            onChange={this.searchValueChange.bind(this)}
            value={this.state.searchValue}
          />
          <Button
            className={styles.addButton}
            type='primary'
            icon={<PlusOutlined />}
            size={this.size}
            onClick={this.newThing}>
            新增
          </Button>
          <Modal
            title={this.title}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <TextArea
              ref={myInput => this.thingInputRef = myInput}
              onChange={this.thingInputContentChange.bind(this)}
              value={this.state.thingInputContent}
              rows={4}
              maxLength={200}
              showCount
            />
          </Modal>
        </div>

        {/* table */}
        <div className="box">
          <Table
            dataSource={this.state.dataSource}
            rowKey="time" columns={this.columns}
            loading={this.state.tableLoading}
            pagination={{ ...this.page, ...{ showTotal: ((total: number) => { return `共 ${total} 条` }) } }}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

export default ThingsManager
