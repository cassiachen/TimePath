// Bilingual (zh/en) dictionary + tiny i18n helper for TimePath, shared across all
// pages. Classic script, exposes global `TimePathI18n`. Language choice persists
// in localStorage ("timepath:lang") and defaults to Chinese. Switching language
// reloads the current page — this is a static multi-page app, not an SPA, so a
// reload is the simplest way to guarantee every dynamic render re-runs in the
// new language rather than tracking re-render callbacks for every page.
(function () {
    var LANG_KEY = "timepath:lang";

    var DICT = {
        "brand.tagline": { zh: "让目标有路径，让时间有安排", en: "Give your goals a path. Give your time a plan." },

        "calendar.mon": { zh: "一", en: "M" }, "calendar.tue": { zh: "二", en: "T" }, "calendar.wed": { zh: "三", en: "W" },
        "calendar.thu": { zh: "四", en: "T" }, "calendar.fri": { zh: "五", en: "F" }, "calendar.sat": { zh: "六", en: "S" }, "calendar.sun": { zh: "日", en: "S" },
        "tasks.calendar_hint": { zh: "点击任务查看详情，点击日期数字查看当天全部任务", en: "Click a task for details, click the date number to see all tasks that day" },

        "common.save": { zh: "保存", en: "Save" },
        "common.cancel": { zh: "取消", en: "Cancel" },
        "common.confirm": { zh: "确认", en: "Confirm" },
        "common.close": { zh: "关闭", en: "Close" },
        "common.edit": { zh: "编辑", en: "Edit" },
        "common.delete": { zh: "删除", en: "Delete" },
        "common.none": { zh: "无", en: "None" },
        "common.optional_field": { zh: "选填", en: "Optional" },
        "common.search_tasks": { zh: "搜索任务…", en: "Search tasks..." },
        "common.settings": { zh: "设置", en: "Settings" },

        "nav.today": { zh: "今日", en: "Today" },
        "nav.tasks": { zh: "任务", en: "Tasks" },
        "nav.goals": { zh: "长期目标", en: "Long-Term Goals" },
        "nav.sop": { zh: "SOP", en: "SOP" },
        "nav.review": { zh: "复盘", en: "Review" },
        "nav.quick_add_task": { zh: "快速添加任务", en: "Quick Add Task" },
        "nav.execution_group": { zh: "日常执行", en: "Daily Execution" },

        "priority.must": { zh: "必须做", en: "Must Do" },
        "priority.should": { zh: "应该做", en: "Should Do" },
        "priority.optional": { zh: "可选", en: "Optional" },

        "status.todo": { zh: "未开始", en: "To Do" },
        "status.in_progress": { zh: "进行中", en: "In Progress" },
        "status.done": { zh: "已完成", en: "Done" },
        "status.delayed": { zh: "已延期", en: "Delayed" },
        "status.skipped": { zh: "已跳过", en: "Skipped" },

        "energy.high": { zh: "高", en: "High" },
        "energy.mid": { zh: "中", en: "Medium" },
        "energy.low": { zh: "低", en: "Low" },

        "today.schedule_title": { zh: "今日排程", en: "Today's Schedule" },
        "today.budget_disposable": { zh: "可支配", en: "Disposable" },
        "today.budget_planned": { zh: "已安排", en: "Planned" },
        "today.budget_remaining": { zh: "剩余", en: "Remaining" },
        "today.overload_banner": { zh: "⚠️ 今日计划可能过载", en: "⚠️ Today's plan may be overloaded" },
        "today.summary": { zh: "已完成 {done} 项 · 剩余 {remaining} 项", en: "Completed {done} • Remaining {remaining}" },
        "today.now": { zh: "现在", en: "NOW" },
        "today.buffer": { zh: "缓冲", en: "Buffer" },
        "today.sub_tasks": { zh: "子任务", en: "Sub-tasks" },
        "today.start": { zh: "开始", en: "Start" },
        "today.overdue": { zh: "已超时 —", en: "Overdue —" },
        "today.delay_continue": { zh: "继续执行", en: "Continue" },
        "today.delay_reschedule": { zh: "重新安排", en: "Reschedule" },
        "today.delay_tomorrow": { zh: "移到明天", en: "Move to tomorrow" },
        "today.delay_abandon": { zh: "放弃", en: "Abandon" },
        "today.tip_title": { zh: "提示：", en: "Tip:" },
        "today.tip_body": { zh: "智能建议会在积累足够历史数据后，在后续版本中上线。", en: "Smart suggestions arrive in a later version, once there's enough history to learn from." },
        "today.reason_tomorrow": { zh: "这项任务为什么要移到明天？", en: "Why is this task moving to tomorrow?" },
        "today.reason_abandon": { zh: "这项任务为什么要放弃？", en: "Why is this task being abandoned?" },
        "today.reason_placeholder": { zh: "选填", en: "Optional" },
        "today.scheduled_suffix": { zh: "计划用时", en: "scheduled" },
        "today.subtasks_progress": { zh: "子任务（{done}/{total}）", en: "Sub-tasks ({done}/{total})" },
        "today.brain_power": { zh: "脑力消耗", en: "Brain power" },
        "today.buffer_with_duration": { zh: "缓冲（{duration}）", en: "Buffer ({duration})" },

        "tasks.directory_title": { zh: "任务目录", en: "Task Directory" },
        "tasks.directory_subtitle": { zh: "管理、追踪并组织你的日常执行。", en: "Manage, track, and organize your daily execution." },
        "tasks.new_task": { zh: "新建任务", en: "New Task" },
        "tasks.filters": { zh: "筛选", en: "Filters" },
        "tasks.priority_all": { zh: "优先级：全部", en: "Priority: All" },
        "tasks.category_all": { zh: "分类：全部", en: "Category: All" },
        "tasks.status_all": { zh: "状态：全部", en: "Status: All" },
        "tasks.clear_all": { zh: "清除筛选", en: "Clear All" },
        "tasks.col_name": { zh: "任务名称", en: "Task Name" },
        "tasks.col_sop": { zh: "关联 SOP", en: "SOP Link" },
        "tasks.col_time": { zh: "时间（计划/实际）", en: "Time (Est/Act)" },
        "tasks.col_priority": { zh: "优先级", en: "Priority" },
        "tasks.col_energy": { zh: "脑力消耗", en: "Energy" },
        "tasks.col_status": { zh: "状态", en: "Status" },
        "tasks.col_actions": { zh: "操作", en: "Actions" },
        "tasks.no_sop": { zh: "未关联 SOP", en: "No SOP" },
        "tasks.subtasks_suffix": { zh: "个子任务", en: "Subtasks" },
        "tasks.subtasks_count": { zh: "{count} 个子任务", en: "{count} Subtasks" },
        "tasks.no_match": { zh: "没有符合筛选条件的任务。", en: "No tasks match these filters." },
        "tasks.day_no_tasks": { zh: "这一天还没有任务。", en: "No tasks for this day yet." },
        "tasks.drawer_title": { zh: "任务详情", en: "Task Details" },
        "tasks.energy_required": { zh: "所需脑力", en: "Energy Required" },
        "tasks.task_breakdown": { zh: "任务拆解", en: "Task Breakdown" },
        "tasks.no_subtasks": { zh: "暂无子任务。", en: "No subtasks." },
        "tasks.mark_complete": { zh: "标记完成", en: "Mark Complete" },
        "tasks.mark_incomplete": { zh: "标记未完成", en: "Mark Incomplete" },
        "tasks.time_label": { zh: "时间", en: "Time" },
        "tasks.est_act": { zh: "计划 {est}h / 实际 {act}h", en: "Est: {est}h / Act: {act}h" },

        "sop.standard_procedures": { zh: "标准作业流程", en: "Standard Procedures" },
        "sop.filter_placeholder": { zh: "筛选 SOP…", en: "Filter SOPs..." },
        "sop.new_sop": { zh: "新建 SOP", en: "New SOP" },
        "sop.steps_duration": { zh: "{steps} 步骤 · {min} 分钟", en: "{steps} steps · {min} min" },
        "sop.no_sops": { zh: "没有找到 SOP。", en: "No SOPs found." },
        "sop.select_prompt": { zh: "选择一个 SOP，或新建一个开始使用。", en: "Select an SOP, or create one to get started." },
        "sop.min_standard": { zh: "最低完成标准", en: "Minimum Standard" },
        "sop.full_standard": { zh: "标准完成标准", en: "Full Standard" },
        "sop.execution_steps": { zh: "执行步骤", en: "Execution Steps" },
        "sop.no_steps": { zh: "还没有步骤 — 编辑此 SOP 来添加。", en: "No steps yet — edit this SOP to add some." },
        "sop.duration_suffix": { zh: "分钟", en: "min duration" },
        "sop.uncategorized": { zh: "未分类", en: "Uncategorized" },
        "sop.start_today": { zh: "开始执行", en: "Start Now" },

        "review.header_title": { zh: "复盘与分析", en: "Review & Analytics" },
        "review.coming_v2": { zh: "即将在 V2 上线", en: "Coming in V2" },
        "review.title": { zh: "效果复盘", en: "Performance Analytics" },
        "review.subtitle": { zh: "查看你的任务执行与时间管理概览。", en: "Overview of your task execution and time management." },
        "review.tab_day": { zh: "日", en: "Day" },
        "review.tab_week": { zh: "周", en: "Week" },
        "review.tab_month": { zh: "月", en: "Month" },
        "review.insights_title": { zh: "系统洞察", en: "System Insights" },
        "review.insights_body": { zh: "基于历史规律的建议（时间低估、精力高峰等）会在积累足够数据后上线。", en: "Pattern-based suggestions (time underestimation, energy peaks) arrive once there's enough history to learn from." },
        "review.completion_rate": { zh: "完成率", en: "Completion Rate" },
        "review.tasks_done": { zh: "已完成任务", en: "Tasks Done" },
        "review.completed_suffix": { zh: "已完成", en: "completed" },
        "review.total_planned": { zh: "计划总时长", en: "Total Planned Time" },
        "review.actual_time": { zh: "实际用时", en: "Actual Time" },
        "review.exec_chart_title": { zh: "计划 vs. 实际执行", en: "Planned vs. Actual Execution" },
        "review.legend_planned": { zh: "计划", en: "Planned" },
        "review.legend_actual": { zh: "实际", en: "Actual" },
        "review.no_tasks_day": { zh: "这一天没有任务记录。", en: "No tasks recorded for this day." },
        "review.execution_efficiency": { zh: "执行效率", en: "Execution Efficiency" },
        "review.efficiency_desc": { zh: "实际用时 ÷ 计划用时（当天任务）。", en: "Actual time ÷ planned time for the day's tasks." },
        "review.delay_reasons": { zh: "延期原因", en: "Delay Reasons" },
        "review.no_delays": { zh: "这一天没有延期记录。", en: "No delays recorded for this day." },
        "review.no_reason": { zh: "未填写原因", en: "No reason given" },
        "review.time_by_category": { zh: "分类时间占比", en: "Time by Category" },
        "review.no_category": { zh: "这一天没有任务记录。", en: "No tasks recorded for this day." },
        "review.sop_completion_title": { zh: "SOP 执行情况", en: "SOP Completion" },
        "review.no_sop_today": { zh: "这一天没有关联 SOP 的任务。", en: "No SOP-linked tasks for this day." },
        "review.sop_steps_done": { zh: "{done}/{total} 步骤", en: "{done}/{total} steps" },
        "review.exceptions_title": { zh: "异常与调整", en: "Exceptions & Adjustments" },
        "review.items_suffix": { zh: "项", en: "Items" },
        "review.no_exceptions": { zh: "这一天没有延期或跳过的任务。", en: "No delayed or skipped tasks for this day." },
        "review.originally": { zh: "原计划：", en: "Originally:" },
        "review.no_reason_given": { zh: "未填写原因。", en: "No reason given." },

        "taskForm.new_title": { zh: "新建任务", en: "New Task" },
        "taskForm.edit_title": { zh: "编辑任务", en: "Edit Task" },
        "taskForm.title_label": { zh: "标题", en: "Title" },
        "taskForm.date_label": { zh: "日期", en: "Date" },
        "taskForm.start_time_label": { zh: "开始时间", en: "Start Time" },
        "taskForm.duration_label": { zh: "预计时长（分钟）", en: "Estimated Duration (min)" },
        "taskForm.overlaps_with": { zh: "⚠️ 与以下任务时间冲突：{names}", en: "⚠️ Overlaps with: {names}" },
        "taskForm.priority_label": { zh: "优先级", en: "Priority" },
        "taskForm.energy_label": { zh: "脑力消耗", en: "Energy" },
        "taskForm.category_label": { zh: "分类", en: "Category" },
        "taskForm.repeat_label": { zh: "重复", en: "Repeat" },
        "taskForm.repeat_none": { zh: "不重复", en: "Does not repeat" },
        "taskForm.repeat_daily": { zh: "每天", en: "Daily" },
        "taskForm.repeat_weekly": { zh: "每周", en: "Weekly" },
        "taskForm.sop_label": { zh: "关联 SOP", en: "SOP" },
        "taskForm.mark_buffer": { zh: "标记为缓冲时间（弹性/空闲）", en: "Mark as Buffer (idle/flex time)" },
        "taskForm.note_label": { zh: "备注", en: "Note" },
        "taskForm.subtasks_label": { zh: "子任务", en: "Subtasks" },
        "taskForm.add_subtask": { zh: "+ 添加", en: "+ Add" },
        "taskForm.delete_task": { zh: "删除任务", en: "Delete Task" },

        "sopForm.new_title": { zh: "新建 SOP", en: "New SOP" },
        "sopForm.edit_title": { zh: "编辑 SOP", en: "Edit SOP" },
        "sopForm.name_label": { zh: "名称", en: "Name" },
        "sopForm.category_label": { zh: "分类", en: "Category" },
        "sopForm.duration_label": { zh: "默认时长（分钟）", en: "Default Duration (min)" },
        "sopForm.steps_label": { zh: "步骤", en: "Steps" },
        "sopForm.add_step": { zh: "+ 添加步骤", en: "+ Add Step" },
        "sopForm.min_standard_label": { zh: "最低完成标准", en: "Minimum Completion Standard" },
        "sopForm.full_standard_label": { zh: "标准完成标准", en: "Full Completion Standard" },
        "sopForm.note_label": { zh: "备注", en: "Note" },
        "sopForm.delete_sop": { zh: "删除 SOP", en: "Delete SOP" },

        "goal.sidebar_title": { zh: "目标", en: "Goals" },
        "goal.empty_state": { zh: "还没有目标，先创建一个长期目标吧。", en: "No goals yet. Create a long-term target to begin." },
        "goal.empty_list": { zh: "没有正在进行中的目标。", en: "No active goals." },
        "goal.summary_progress": { zh: "目标进度", en: "Goal Progress" },
        "goal.summary_time": { zh: "时间进度", en: "Time Progress" },
        "goal.summary_gap": { zh: "计划差距", en: "Gap" },
        "goal.summary_remaining": { zh: "剩余天数", en: "Remaining" },
        "goal.day_unit": { zh: " 天", en: "d" },
        "goal.remaining_prefix": { zh: "剩余", en: "Remaining" },
        "goal.time_map": { zh: "时间地图", en: "Time Map" },
        "goal.level_year": { zh: "年目标", en: "Year" },
        "goal.level_month": { zh: "月目标", en: "Month" },
        "goal.level_week": { zh: "周目标", en: "Week" },
        "goal.level_day": { zh: "日目标", en: "Day" },
        "goal.level_timeblock": { zh: "时间块", en: "Time Block" },
        "goal.toggle_status": { zh: "切换状态", en: "Toggle" },
        "goal.add_child": { zh: "新增子节点", en: "Add child" },
        "goal.create_task": { zh: "生成任务", en: "Create task" },
        "goal.delete_node": { zh: "删除", en: "Delete" },
        "goal.no_description": { zh: "暂无说明", en: "No description yet." },
        "goal.add_root_node": { zh: "新增顶层节点", en: "Add root node" },
        "goal.node_title": { zh: "节点标题", en: "Node title" },
        "goal.node_level": { zh: "层级", en: "Level" },
        "goal.node_description": { zh: "说明", en: "Description" },
        "goal.new_goal": { zh: "新建目标", en: "New Goal" },
        "goal.weekly_breakdown": { zh: "月任务表", en: "Weekly Breakdown" },
        "goal.week_label": { zh: "月份", en: "Week" },
        "goal.focus_label": { zh: "焦点", en: "Focus" },
        "goal.status_label": { zh: "状态", en: "Status" },
        "goal.linked_tasks_label": { zh: "关联任务", en: "Linked Tasks" },
        "goal.no_goal_selected": { zh: "还没有选中目标。", en: "No goal selected." },
        "goal.days_remaining": { zh: "剩余 {days} 天", en: "{days} days remaining" },
        "goal.overdue_label": { zh: "已到期", en: "Overdue" },
        "goal.goal_count": { zh: "{count} 个长期目标", en: "{count} long-term goals" },
        "goal.monthly_timeline": { zh: "月度目标时间线", en: "Monthly Goals Timeline" },
        "goal.add_month": { zh: "新增月度目标", en: "Add Month" },
        "goal.add_week": { zh: "新增周计划", en: "Add Week" },
        "goal.no_monthly_goals": { zh: "还没有月度目标。", en: "No monthly goals yet." },
        "goal.no_weekly_goals": { zh: "还没有周计划。", en: "No weekly goals yet." },
        "goal.status_paused": { zh: "已暂停", en: "Paused" },
        "goal.status_active": { zh: "进行中", en: "Active" },
        "goal.confirm_delete_node": { zh: "确定要删除这个节点吗？", en: "Delete this node?" },
        "goal.page_intro": { zh: "把长期目标拆解成月度里程碑和每周计划。具体哪天做什么，去「今日」按天安排；固定动作的标准流程，去「SOP」沉淀。", en: "Break a long-term goal into monthly milestones and weekly plans. Schedule the day-to-day on Today, and codify repeatable steps as an SOP." },
        "goal.roadmap_title": { zh: "路线图", en: "Roadmap" },
        "goal.breakdown_title": { zh: "月度 → 每周拆解", en: "Monthly → Weekly Breakdown" },
        "goal.breakdown_subtitle": { zh: "每个月度目标下可以再拆出几周的计划", en: "Break each month down into a few weeks of plans" },
        "goal.no_goals": { zh: "还没有目标，新建一个开始拆解吧。", en: "No goals yet — create one to start breaking it down." },
        "goal.add_week_to_month": { zh: "+ 本月新增周计划", en: "+ Add week to this month" },
        "goal.unlink_task": { zh: "取消关联", en: "Unlink" },
        "today.linked_goal": { zh: "关联目标：{goal} · {node}", en: "Linked goal: {goal} · {node}" },
        "common.add": { zh: "新增", en: "Add" },

        "goalForm.new_title": { zh: "新建目标", en: "New Goal" },
        "goalForm.edit_title": { zh: "编辑目标", en: "Edit Goal" },
        "goalForm.name_label": { zh: "目标名称", en: "Goal Name" },
        "goalForm.category_label": { zh: "分类", en: "Category" },
        "goalForm.start_label": { zh: "开始时间", en: "Start Date" },
        "goalForm.end_label": { zh: "截止时间", en: "End Date" },
        "goalForm.description_label": { zh: "目标内容", en: "Description" },
        "goalForm.delete_goal": { zh: "删除目标", en: "Delete Goal" },

        "settingsForm.title": { zh: "时间预算", en: "Time Budget" },
        "settingsForm.first_run_title": { zh: "欢迎使用，先设置一下时间预算", en: "Welcome — set up your time budget" },
        "settingsForm.desc": { zh: "每天为固定活动预留的小时数，剩下的会成为你的可支配时间。", en: "Hours per day reserved for fixed activities. The rest becomes your Disposable time." },
        "settingsForm.sleep": { zh: "睡眠", en: "Sleep" },
        "settingsForm.work": { zh: "工作", en: "Work" },
        "settingsForm.meals": { zh: "吃饭", en: "Meals" },
        "settingsForm.commute": { zh: "通勤", en: "Commute" },
        "settingsForm.exercise": { zh: "运动", en: "Exercise" },
        "settingsForm.study": { zh: "学习", en: "Study" },
        "settingsForm.entertainment": { zh: "娱乐", en: "Entertainment" },
        "settingsForm.other": { zh: "其他", en: "Other" },
        "settingsForm.summary": { zh: "固定：{fixed}h → 可支配：{disposable}h", en: "Fixed: {fixed}h  →  Disposable: {disposable}h" },

        "auth.local_only": { zh: "本地模式（未配置云端）", en: "Local only (cloud not configured)" },
        "auth.sign_in": { zh: "登录 / 注册", en: "Sign in / Register" },
        "auth.sign_in_hint": { zh: "同步到云端，多设备可用", en: "Sync to the cloud, use on any device" },
        "auth.sign_out": { zh: "退出登录", en: "Sign out" },
        "auth.brand_tagline": { zh: "让目标有路径，让时间有安排", en: "Give your goals a path. Give your time a plan." },
        "auth.login_title": { zh: "登录", en: "Sign In" },
        "auth.register_title": { zh: "注册", en: "Create Account" },
        "auth.email_label": { zh: "邮箱", en: "Email" },
        "auth.password_label": { zh: "密码", en: "Password" },
        "auth.password_hint": { zh: "至少 6 位", en: "At least 6 characters" },
        "auth.submit_login": { zh: "登录", en: "Sign In" },
        "auth.submit_register": { zh: "注册", en: "Create Account" },
        "auth.toggle_to_register": { zh: "还没有账号？去注册", en: "No account yet? Register" },
        "auth.toggle_to_login": { zh: "已有账号？去登录", en: "Already have an account? Sign in" },
        "auth.continue_local": { zh: "先不登录，直接使用本地模式", en: "Skip for now — continue in local mode" },
        "auth.error_generic": { zh: "出错了，请稍后重试。", en: "Something went wrong. Please try again." },
        "auth.error_cloud_unavailable": { zh: "云端功能暂不可用（未配置或离线），可以先使用本地模式，数据仍会保存在本机。", en: "Cloud sync is unavailable right now (not configured, or offline). You can continue in local mode — your data still saves on this device." },
        "auth.check_email_confirm": { zh: "注册成功，请查收邮箱完成验证后再登录。", en: "Account created — check your email to confirm before signing in." },
        "auth.signing_in": { zh: "登录中…", en: "Signing in…" },
        "auth.signing_up": { zh: "注册中…", en: "Creating account…" },

        "migration.confirm_message": { zh: "检测到这是你在本设备上第一次登录，云端账户目前还没有数据。是否把本机现有的任务、SOP 和目标上传到云端？本机数据不会被删除。", en: "First time signing in on this device, and your cloud account is empty. Upload this device's existing tasks, SOPs, and goals to the cloud? Nothing on this device will be deleted." }
    };

    function getLang() {
        try {
            return localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
        } catch (e) {
            return "zh";
        }
    }

    function setLang(lang) {
        try { localStorage.setItem(LANG_KEY, lang === "en" ? "en" : "zh"); } catch (e) {}
        window.location.reload();
    }

    function t(key, vars) {
        var entry = DICT[key];
        var str = entry ? (entry[getLang()] || entry.en || key) : key;
        if (vars) {
            Object.keys(vars).forEach(function (k) {
                str = str.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
            });
        }
        return str;
    }

    // Applies translations to every element in the document carrying data-i18n /
    // data-i18n-placeholder attributes. Call once after the page's static markup
    // (nav, headers, labels) has loaded.
    function applyStatic(root) {
        (root || document).querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        (root || document).querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
        });
        (root || document).querySelectorAll("[data-i18n-title]").forEach(function (el) {
            el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
        });
        document.documentElement.lang = getLang() === "zh" ? "zh-CN" : "en";
    }

    // Renders a small "中 / EN" language toggle. Call with a container element;
    // the toggle reflects the current language and switches (reloading) on click.
    function renderSwitcher(container) {
        var lang = getLang();
        container.innerHTML =
            '<div class="inline-flex items-center border border-outline-variant rounded-full overflow-hidden text-[11px] font-label-md">' +
            '<button data-lang="zh" class="px-2 py-1 ' + (lang === "zh" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container") + '">中</button>' +
            '<button data-lang="en" class="px-2 py-1 ' + (lang === "en" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container") + '">EN</button>' +
            '</div>';
        container.querySelectorAll("[data-lang]").forEach(function (btn) {
            btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
        });
    }

    window.TimePathI18n = { t: t, getLang: getLang, setLang: setLang, applyStatic: applyStatic, renderSwitcher: renderSwitcher };
})();
