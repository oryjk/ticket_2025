import { config } from '../config/env'

interface PositionArea {
    name: string
    refundCount: number
}

export interface SeatSection {
    title: string
    price: number
    color: string
    positions: PositionArea[]
}

interface MatchData {
    homeTeam: string
    awayTeam: string
    seatSections: SeatSection[]
}

// Mock数据
const mockDataMap: Record<string, MatchData> = {
    'match1': {
    homeTeam: '成都蓉城',
    awayTeam: '北京国安',
    seatSections: [
        {
            title: 'S类看台',
            price: 400,
            color: "#052816",
            positions: [
                { name: 'A1区', refundCount: 0 },
                { name: 'A2区', refundCount: 3 },
                { name: 'A3区', refundCount: 2 },
                { name: 'A4区', refundCount: 4 },
                { name: 'A5区', refundCount: 11 },
                { name: 'A6区', refundCount: 3 },
                { name: 'A7区', refundCount: 4 },
                { name: 'A8区', refundCount: 1 },
                { name: 'A9区', refundCount: 1 },
                { name: 'A10区', refundCount: 1 }
            ]
        },
        {
            title: 'A类看台',
            price: 220,
            color: "#ffcc00",
            positions: [
                { name: 'B1区', refundCount: 4 },
                { name: 'B2区', refundCount: 2 },
                { name: 'B3区', refundCount: 3 },
                { name: 'B4区', refundCount: 9 },
                { name: 'B5区', refundCount: 3 },
                { name: 'B6区', refundCount: 2 },
                { name: 'B7区', refundCount: 1 },
                { name: 'B8区', refundCount: 4 }
            ]
        },
        {
            title: 'B类看台',
            price: 180,
            color: "#00cc00",
            positions: [
                { name: 'C1区', refundCount: 3 },
                { name: 'C2区', refundCount: 2 },
                { name: 'C3区', refundCount: 4 },
                { name: 'C4区', refundCount: 1 }
            ]
        },
        {
            title: 'C类看台',
            price: 150,
            color: "#0066ff",
            positions: [
                { name: 'D1区', refundCount: 2 },
                { name: 'D2区', refundCount: 0 },
                { name: 'D3区', refundCount: 1 },
                { name: 'D4区', refundCount: 4 }
            ]
        },
        {
            title: 'D类看台',
            price: 120,
            color: "#0033cc",
            positions: [
                { name: 'E1区', refundCount: 3 },
                { name: 'E2区', refundCount: 2 },
                { name: 'E3区', refundCount: 4 },
                { name: 'E4区', refundCount: 1 }
            ]
        },
        {
            title: 'E类看台',
            price: 100,
            color: "#9900ff",
            positions: [
                { name: 'F1区', refundCount: 2 },
                { name: 'F2区', refundCount: 3 },
                { name: 'F3区', refundCount: 1 },
                { name: 'F4区', refundCount: 4 }
            ]
        }
    ]
    },
    'match2': {
        homeTeam: '主队',
        awayTeam: '客队B',
        seatSections: [
            {
                title: 'S类看台',
                price: 380,
                color: "#052816",
                positions: [
                    { name: 'A1区', refundCount: 1 },
                    { name: 'A2区', refundCount: 2 },
                    { name: 'A3区', refundCount: 0 }
                ]
            }
        ]
    },
    'match3': {
        homeTeam: '主队',
        awayTeam: '客队C',
        seatSections: [
            {
                title: 'S类看台',
                price: 420,
                color: "#052816",
                positions: [
                    { name: 'A1区', refundCount: 3 },
                    { name: 'A2区', refundCount: 1 },
                    { name: 'A3区', refundCount: 2 }
                ]
            }
        ]
    }
}

// 统一的API请求处理函数
export const fetchMatchData = async (matchId?: string): Promise<MatchData> => {
    if (config.useMock) {
        if (!matchId) {
            return mockDataMap['match1']
        }
        const matchData = mockDataMap[matchId]
        if (!matchData) {
            throw new Error(`未找到比赛数据: ${matchId}`)
        }
        return matchData
    }

    try {
        const response = await fetch(`/api/schedule/list${matchId ? `/${matchId}` : ''}`,)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return {
            homeTeam: data.homeTeam,
            awayTeam: data.awayTeam,
            seatSections: data.seatSections
        }
    } catch (error) {
        console.error('API请求失败:', error)
        throw error
    }
}