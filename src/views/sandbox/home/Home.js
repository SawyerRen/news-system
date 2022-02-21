import React, {useEffect, useRef, useState} from 'react'
import {Avatar, Card, Col, Drawer, List, Row} from 'antd';
import {EditOutlined, EllipsisOutlined, SettingOutlined} from "@ant-design/icons";
import axios from "axios";
import * as echarts from "echarts";
import _ from 'lodash';

const {Meta} = Card;
export default function Home() {
    const [viewList, setViewList] = useState([]);
    const [starList, setStarList] = useState([]);
    const [allList, setAllList] = useState([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const pieRef = useRef()
    const barRef = useRef()
    useEffect(() => {
        axios.get(`/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6`)
            .then(res => {
                setViewList(res.data);
            })
    }, [])
    useEffect(() => {
        axios.get(`/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6`)
            .then(res => {
                setStarList(res.data);
            })
    }, [])

    useEffect(() => {
        axios.get(`http://localhost:5000/news?publishState=2&_expand=category`).then(res => {
            renderBarView(_.groupBy(res.data, item => item.category.title));
            setAllList(res.data);
        })
        return () => {
            window.onresize = null;
        }
    }, [])

    const renderBarView = (data) => {
        const myChart = echarts.init(barRef.current);

        // 指定图表的配置项和数据
        const option = {
            title: {
                text: '新闻分类图示'
            },
            tooltip: {},
            legend: {
                data: ['数量']
            },
            xAxis: {
                data: Object.keys(data),
                axisLabel: {
                    // rotate: "60",
                    interval: 0,
                }
            },
            yAxis: {
                minInterval: 1,
            },
            series: [
                {
                    name: '数量',
                    type: 'bar',
                    data: Object.values(data).map(item => item.length),
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        option && myChart.setOption(option);
        window.onresize = () => {
            myChart.resize();
        }
    }
    const renderPieView = () => {

        const currentList = allList.filter(item => item.author === username);
        const groupObj = _.groupBy(currentList, item => item.category.title);
        const list = [];
        for (let i in groupObj) {
            list.push({
                name:i,
                value:groupObj[i].length,
            })
        }
        const myChart = echarts.init(pieRef.current);
        const option = {
            title: {
                text: '当前用户新闻分类',
                // subtext: 'Fake Data',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
        option && myChart.setOption(option);
        window.onresize = () => {
            myChart.resize();
        }
    }
    const {username, region, role: {roleName}} = JSON.parse(localStorage.getItem("token"));
    return (
        <div className="site-card-wrapper">
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Visit most" bordered={true}>
                        <List
                            size="small"
                            dataSource={viewList}
                            renderItem={item => <List.Item>
                                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                            </List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Star most" bordered={true}>
                        <List
                            size="small"
                            dataSource={starList}
                            renderItem={item => <List.Item>
                                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                            </List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        cover={
                            <img
                                alt="example"
                                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                            />
                        }
                        actions={[
                            <SettingOutlined key="setting" onClick={() => {
                                setTimeout(() => {
                                    setIsDrawerVisible(true)
                                    renderPieView()
                                }, 0)
                            }}/>,
                            <EditOutlined key="edit"/>,
                            <EllipsisOutlined key="ellipsis"/>,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar src="https://joeschmoe.io/api/v1/random"/>}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : "全球"}</b>
                                    <span>{roleName}</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>
            <Drawer width="500px" title="个人新闻分类" placement="right" onClose={() => {
                setIsDrawerVisible(!isDrawerVisible);
            }} visible={isDrawerVisible}>
                <div ref={pieRef} style={{
                    height: "400px",
                    width: "100%",
                    marginTop: "30px",
                }}/>
            </Drawer>
            <div ref={barRef} style={{
                height: "400px",
                width: "100%",
                marginTop: "30px",
            }}>

            </div>
        </div>
    )
}
