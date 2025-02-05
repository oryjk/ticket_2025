<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-info" @click="handleGetUserInfo">
			<image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
			<view class="info-right">
				<text class="nickname">
					{{ userInfo.nickName || '点击登录' }}
				</text>
				<text class="member-tag" :class="{ 'is-member': userInfo.isMember }">
					{{ memberStatusText }}
				</text>
				<text v-if="!userInfo.isMember" class="member-price">
					￥{{ memberPrice }}/年
				</text>
			</view>
		</view>

		<!-- 会员开通按钮 -->
		<view v-if="!userInfo.isMember" class="member-btn">
			<button class="open-member" @click="handleOpenMember">
				立即开通会员
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { reactive, onMounted } from 'vue'
	import { computed } from 'vue' // 添加导入

	interface UserInfo {
		avatarUrl ?: string
		nickName ?: string
		openid ?: string
		isMember : boolean
		memberLevel : number
	}
	interface PaymentParams {
		timeStamp : string
		nonceStr : string
		package : string
		signType : 'MD5' | 'HMAC-SHA256'
		paySign : string
	}

	const userInfo = reactive<UserInfo>({
		avatarUrl: '',
		nickName: '',
		openid: '',
		isMember: false,
		memberLevel: 0
	})

	// 会员价格（可从后端获取）
	const memberPrice = 99

	// 计算属性替代方案
	const memberStatusText = computed(() => {
		return userInfo.isMember
			? `会员等级：${userInfo.memberLevel}`
			: '非会员'
	})

	// 初始化检查缓存
	onMounted(() => {
		checkLocalStorage()
	})

	// 检查本地缓存
	const checkLocalStorage = () => {
		try {
			const cached = uni.getStorageSync('userInfo')
			if (cached) {
				Object.assign(userInfo, cached)
				checkMembershipStatus()
			}
		} catch (e) {
			console.log('本地缓存读取失败:', e)
		}
	}

	// 获取用户信息（更新版）
	const handleGetUserInfo = async () => {
		if (userInfo.openid) return

		try {
			const loginRes = await uni.login({ provider: 'weixin' })
			const userProfile = await uni.getUserProfile({
				desc: '用于完善会员信息'
			})

			const { data: openid } = await uni.request({
				url: '你的后端接口地址',
				method: 'POST',
				data: { code: loginRes.code }
			})

			updateUserInfo({
				avatarUrl: userProfile.userInfo.avatarUrl,
				nickName: userProfile.userInfo.nickName,
				openid
			})

			await checkMembershipStatus()
		} catch (error) {
			handleError('授权失败', error)
		}
	}

	// 更新用户信息并缓存
	const updateUserInfo = (data : Partial<UserInfo>) => {
		Object.assign(userInfo, data)
		uni.setStorageSync('userInfo', userInfo)
	}

	// 开通会员处理
	const handleOpenMember = async () => {
		// 显示会员权益
		const res = await uni.showModal({
			title: '开通会员',
			content: "会员专属权益：✅当前比赛座位实时分析\n ✅历史比赛座位分析\n ✅高级数据分析 \n",
			confirmText: `￥${memberPrice}开通`,
			cancelText: '再想想'
		})

		if (res.confirm) {
			try {
				// 获取支付参数
				const { data: paymentParams } = await uni.request({
					url: '你的支付接口地址',
					method: 'POST',
					data: { openid: userInfo.openid }
				})

				// 发起支付
				const paymentRes = await uni.requestPayment(paymentParams)

				if (paymentRes.errMsg === 'requestPayment:ok') {
					// 支付成功更新状态
					updateUserInfo({ isMember: true, memberLevel: 1 })
					uni.showToast({ title: '开通成功！', icon: 'success' })
				}
			} catch (error) {
				handleError('支付失败', error)
			}
		}
	}

	// 检查会员状态（更新版）
	const checkMembershipStatus = async () => {
		if (!userInfo.openid) return

		try {
			const { data: memberInfo } = await uni.request({
				url: '你的会员检查接口地址',
				data: { openid: userInfo.openid }
			})

			updateUserInfo({
				isMember: memberInfo.isMember,
				memberLevel: memberInfo.level || 0
			})
		} catch (error) {
			handleError('获取会员信息失败', error)
		}
	}

	// 统一错误处理
	const handleError = (title : string, error : any) => {
		uni.showToast({ title, icon: 'none' })
		console.error(`${title}:`, error)
	}
</script>

<style lang="scss">
	.container {
		padding: 30rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 30rpx;
	}

	.info-right {
		flex: 1;
	}

	.nickname {
		display: block;
		font-size: 36rpx;
		color: #333;
		margin-bottom: 12rpx;
	}

	.member-tag {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 24rpx;
		background: #eee;
		color: #666;

		&.is-member {
			background: #ffd700;
			color: #d48806;
		}
	}

	/* 原有样式保持不变，新增以下样式 */
	.member-price {
		display: block;
		font-size: 28rpx;
		color: #eb5757;
		margin-top: 8rpx;
	}

	.member-btn {
		margin: 40rpx 30rpx;

		.open-member {
			background: #07c160;
			color: white;
			border-radius: 50rpx;
			font-size: 32rpx;

			&::after {
				border: none;
			}

			&:active {
				opacity: 0.8;
			}
		}
	}

	/* 优化会员标签样式 */
	.member-tag {
		&.is-member {
			background: #07c160;
			color: white;
		}
	}
</style>