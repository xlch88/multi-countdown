<template>
	<main>
		<section class="rooms">
			<div :class="`item ${item.jobs.length > 0 ? 'active' : ''} ${item.jobs.length}`" v-for="(item, index) in countdown">
				<div class="index">{{ item.name }}</div>
				<div class="jobs">
					<div :class="`item type-${item2.type}`" v-for="(item2, index2) in item.jobs">
						<div class="type">{{ { 1: "游玩", 2: "预约" }[item2.type] || item2.type }}</div>
						<div class="time">{{ item2.info }}</div>
						<div class="comment">{{ item2.comment }}</div>
						<div class="buttons"><button @click="deleteJob(index, index2)">删除</button></div>
					</div>
				</div>
				<button v-if="item.status === 0" @click="set(index)">添加</button>
			</div>
		</section>
		<section class="log">
			<div class="item" v-for="log in logs">
				<span class="time">[{{ log.time }}]</span>
				<span class="text">{{ log.text }}</span>
			</div>
		</section>
	</main>

	<div class="set-cover" v-if="isShowSet">
		<div class="set" v-if="isShowSet">
			<div class="form">
				<div class="row">
					<span>类型</span>
					<span>
						<label><input type="radio" v-model="form.type" :value="1" /> 游玩</label>
						<label><input type="radio" v-model="form.type" :value="2" /> 预约</label>
					</span>
				</div>
				<div class="row" v-if="form.type === 2">
					<span>时间类型</span>
					<span>
						<label><input type="radio" v-model="form.timeType" :value="1" /> 几小时后</label>
						<label><input type="radio" v-model="form.timeType" :value="2" /> 具体日期</label>
					</span>
				</div>
				<div class="row" v-if="form.type === 2">
					<span>时间</span>
					<span>
						<input v-if="form.timeType === 1" type="number" v-model="form.timeHour" />
						<input
							v-if="form.timeType === 2"
							type="datetime-local"
							v-model="form.timeDate"
							placeholder="2023-07-18 20:55:00"
						/>
					</span>
				</div>
				<div class="row">
					<span>备注</span>
					<span><input v-model="form.comment" /></span>
				</div>
				<div class="row">
					<button @click="submit()">提交</button>
					<button @click="isShowSet = false">取消</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import helper from "./helper";

let tickInterval = 0;
const statusName = {
	1: "游玩",
	2: "预约",
};

export default {
	data() {
		return {
			isShowSet: false,
			setActive: 0,

			form: {
				type: 1,
				timeType: 1,
				timeHour: 1,
				timeDate: "",
				comment: "",
			},

			rooms: [
				{
					name: "大包厢",
				},
				{
					name: "卡比包厢",
				},
				{
					name: "皮卡丘包厢",
				},
				{
					name: "初音包厢",
				},

				{
					name: "喵斯包厢",
				},
				{
					name: "动森包厢",
				},
				{
					name: "马里奥包厢",
				},
				{
					name: "大厅大沙发",
				},

				{
					name: "大厅5",
				},
				{
					name: "大厅4",
				},
				{
					name: "大厅3",
				},
				{
					name: "大厅2",
				},
				{
					name: "大厅1",
				},
			],

			countdown: [],
			logs: [],
		};
	},
	mounted() {
		this.countdown = this.rooms.map((v) => {
			return {
				name: v.name,
				status: 0,
				info: "",
				// endTime: new Date(),
				latestStatus: 0,
				comment: "",

				jobs: [],
			};
		});

		tickInterval = setInterval(() => {
			this.tick();
		}, 500);

		this.log("欢迎使用");
		this.load();
		this.tick();
	},
	unmounted() {
		clearInterval(tickInterval);
	},
	methods: {
		tts(t) {
			window.speechSynthesis.cancel();
			let utterThis = new window.SpeechSynthesisUtterance(t);
			utterThis.voice = window.speechSynthesis.getVoices().filter((v) => v.localService && v.lang === "zh-CN")[2];
			utterThis.rate = 1;
			utterThis.volume = 1;
			window.speechSynthesis.speak(utterThis);
		},
		log(text) {
			this.logs.unshift({
				time: helper.formatTime(new Date(), "yyyy-MM-dd hh:mm:ss"),
				text: text,
			});
			this.logs = this.logs.slice(0, 50);
		},
		set(index) {
			this.form = {
				type: 1,
				timeType: 1,
				timeHour: 1,
				timeDate: helper.formatTime(new Date().getTime() + 3600 * 1000, "yyyy-MM-dd hh:mm:ss"),
				comment: "",
			};
			this.isShowSet = true;
			this.setActive = index;
		},
		submit() {
			if (this.form.type === 2) {
				if (this.form.timeType === 1 && this.form.timeHour < 0) {
					return alert("时间不能小于0！");
				}

				if (
					this.form.timeType === 2 &&
					(isNaN(new Date(this.form.timeDate).getTime()) ||
						new Date(this.form.timeDate).getTime() < new Date().getTime())
				) {
					return alert("时间填写错误或小于当前时间！");
				}
			}

			let job = {
				type: this.form.type,
				comment: this.form.comment,
				startTime: helper.formatTime(new Date(), "yyyy-MM-dd hh:mm:ss"),
			};

			if (this.form.timeType === 1) {
				job.endTime = helper.formatTime(
					new Date(new Date().getTime() + 3600 * 1000 * this.form.timeHour),
					"yyyy-MM-dd hh:mm:ss"
				);
			} else {
				job.endTime = helper.formatTime(new Date(this.form.timeDate), "yyyy-MM-dd hh:mm:ss");
			}

			this.countdown[this.setActive].jobs.push(job);

			this.tick();

			if (this.form.type === 1) {
				this.log(
					`添加 ${this.rooms[this.setActive].name} 的 游玩 状态，备注：${
						this.countdown[this.setActive].comment || "无"
					}`
				);
			} else {
				this.log(
					`添加 ${this.rooms[this.setActive].name} 从 ${job.startTime} 至 ${job.endTime} 的 预约 状态，备注：${
						this.countdown[this.setActive].comment || "无"
					}`
				);
			}

			this.isShowSet = false;
			this.save();
		},
		deleteJob(i1, i2) {
			delete this.countdown[i1].jobs[i2];

			this.countdown[i1].jobs = this.countdown[i1].jobs.filter(Boolean);
		},
		tick() {
			this.countdown = this.countdown.map((item, index) => {
				item.jobs = item.jobs.map((item2, index2) => {
					let startTime = new Date(item2.startTime);
					let endTime = new Date(item2.endTime);

					if (item2.type === 1) {
						item2.info = helper.formatSecond((new Date().getTime() - startTime.getTime()) / 1000);
					}
					if (item2.type === 2) {
						if (endTime.getTime() - new Date().getTime() < 0) {
							item2.info = `已到期${helper.formatSecond(
								Math.abs((endTime.getTime() - new Date().getTime()) / 1000)
							)}`;
						} else {
							item2.info = helper.formatSecond((endTime.getTime() - new Date().getTime()) / 1000);
						}
					}
					return item2;
				});

				return item;
			});
		},

		save() {
			localStorage.setItem("save", JSON.stringify(this.countdown));
		},
		load() {
			if (localStorage.getItem("save")) {
				this.countdown = JSON.parse(localStorage.getItem("save"));
			}
		},
	},
};
</script>

<style lang="scss">
body {
	margin: 0;
}

* {
	box-sizing: border-box;
}

main {
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	height: 100vh;
	.rooms {
		height: 100%;
		position: relative;
		margin: 10px 0 10px 10px;
		> .item {
			position: absolute;
			border: 2px dashed #bdbdbd;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;

			&.active {
				border-color: black;
			}

			.index {
				font-size: 32px;
			}

			> button {
				//margin-top: 10px;
			}

			.jobs {
				width: 100%;
				margin-bottom: 5px;
				> .item {
					border-bottom: 1px solid #000;
					width: calc(100% - 20px);
					margin: 0 10px;
					padding: 3px;
					display: flex;
					justify-content: space-between;

					&.type-1 {
						border-color: #8bc34a;
					}
					&.type-2 {
						border-color: #ff9800;
					}

					.type {
					}
					.time {
					}
					.comment {
					}
					.buttons {
					}
				}
			}

			&:nth-child(1),
			&:nth-child(2),
			&:nth-child(3),
			&:nth-child(4) {
				width: calc(100% / 5 - 10px);
				height: 25%;
				left: 0;
			}
			&:nth-child(1) {
				width: calc(100% / 5 * 2 - 10px);
			}
			&:nth-child(2) {
				left: calc(100% / 5 * 2);
			}
			&:nth-child(3) {
				left: calc(100% / 5 * 3);
			}
			&:nth-child(4) {
				left: calc(100% / 5 * 4);
			}

			&:nth-child(5),
			&:nth-child(6),
			&:nth-child(7),
			&:nth-child(8) {
				width: calc(100% / 5 - 10px);
				height: 25%;
				top: 30%;
			}
			&:nth-child(6) {
				left: calc(100% / 5);
			}
			&:nth-child(7) {
				left: calc(100% / 5 * 2);
			}
			&:nth-child(8) {
				left: calc(100% / 5 * 3);
			}

			&:nth-child(9),
			&:nth-child(10),
			&:nth-child(11),
			&:nth-child(12),
			&:nth-child(13) {
				bottom: 0;
				width: calc(100% / 5 - 10px);
				height: 25%;
			}
			&:nth-child(10) {
				left: calc(100% / 5);
			}
			&:nth-child(11) {
				left: calc(100% / 5 * 2);
			}
			&:nth-child(12) {
				left: calc(100% / 5 * 3);
			}
			&:nth-child(13) {
				left: calc(100% / 5 * 4);
			}
		}
	}

	.log {
		height: 300px;
		border-top: 1px solid #000;
		overflow-y: scroll;
		.item {
			border-bottom: 1px dashed rgba(#000, 0.1);
			.time {
				color: #2196f3;
				margin-right: 5px;
			}
			.text {
			}
		}
	}
}

.set-cover {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #00000070;
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;

	.set {
		background: #fff;
		width: 300px;
		height: 300px;
		border-radius: 10px;
		box-shadow: 0px 0px 20px rgb(0 0 0 / 30%);
	}
}

.form {
	.row {
		display: flex;
		justify-content: space-between;
		padding: 10px;
		align-items: center;
	}
}
</style>
