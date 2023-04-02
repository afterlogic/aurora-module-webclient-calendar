<template>
  <q-scroll-area class="full-height full-width">
    <div class="q-pa-lg">
      <div class="row q-mb-md">
        <div class="col text-h5" v-t="'CALENDARWEBCLIENT.HEADING_SETTINGS_TAB'" />
      </div>
      <q-card flat bordered class="card-edit-settings">
        <q-card-section>
          <div class="row">
            <div class="col-2 q-my-sm" v-t="'CALENDARWEBCLIENT.LABEL_WORKDAY_STARTS'"></div>
            <div class="col-2">
              <q-select flat
                        outlined
                        dense class="bg-white select" v-model="workdayStarts"
                        :options="timeList"/>
            </div>
            <div class="col-1 q-my-sm">
              <div class="q-mr-md" style="text-align: right">{{ $t('CALENDARWEBCLIENT.LABEL_WORKDAY_ENDS') }}</div>
            </div>
            <div class="col-2">
              <q-select flat
                        outlined
                        dense class="bg-white select" v-model="workdayEnds"
                        :options="timeList"/>
            </div>
          </div>
          <div class="row q-my-md">
            <div class="col-2 q-my-md"></div>
                <q-checkbox dense v-model="highlightWorkingHours" color="primary">
                  <q-item-label v-t="'CALENDARWEBCLIENT.LABEL_SHOW_WORKDAY'" />
                </q-checkbox>
          </div>
          <div class="row">
            <div class="col-2 q-my-sm" v-t="'CALENDARWEBCLIENT.LABEL_WEEK_STARTS_ON'"></div>
            <div class="col-2">
              <q-select flat
                        outlined
                        dense class="bg-white select" v-model="weekStartsOn"
                        :options="weekStartsList"/>
            </div>
          </div>
          <div class="row q-my-md">
            <div class="col-2 q-my-md"></div>
                <q-checkbox dense v-model="highlightWorkingDays" color="primary">
                  <q-item-label v-t="'CALENDARWEBCLIENT.LABEL_HIGHLIGHT_WORK_DAYS'" />
                </q-checkbox>
          </div>
          <div class="row">
            <div class="col-2 q-my-sm" v-t="'CALENDARWEBCLIENT.LABEL_DEFAULT_TAB'"></div>
            <div class="col-5">
              <div class="  q-my-sm">
                <q-radio dense v-model="timeFormat" :val="1" :label="$t('CALENDARWEBCLIENT.ACTION_SHOW_DAY_VIEW')"/>
                <q-radio class="q-ml-md" dense v-model="timeFormat" :val="2"
                         :label="$t('CALENDARWEBCLIENT.ACTION_SHOW_WEEK_VIEW')"/>
                <q-radio class="q-ml-md" dense v-model="timeFormat" :val="3"
                         :label="$t('CALENDARWEBCLIENT.ACTION_SHOW_MONTH_VIEW')"/>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <div class="q-pt-md text-right">
        <q-btn unelevated no-caps dense class="q-px-sm" :ripple="false" color="primary" @click="save"
               :label="$t('COREWEBCLIENT.ACTION_SAVE')">
        </q-btn>
      </div>
    </div>
    <q-inner-loading style="justify-content: flex-start;" :showing="saving">
      <q-linear-progress query />
    </q-inner-loading>
  </q-scroll-area>
</template>

<script>
import webApi from 'src/utils/web-api'
import errors from 'src/utils/errors'
import notification from 'src/utils/notification'

import settings from '../settings'
import calendar from '../utils/calendar'

export default {
  name: 'CalendarAdminSettings',

  data () {
    return {
      saving: false,
      highlightWorkingDays: false,
      highlightWorkingHours: false,
      workdayEnds: '',
      workdayStarts: '',
      timeFormat: 1,
      weekStartsOn: ''
    }
  },

  computed: {
    timeList () {
      const timeList = calendar.getTimeListStepHalfHour()
      return timeList.map((timeData, key) => {
        return {
          label: timeData,
          value: key
        }
      })
    },
    weekStartsList () {
      return [
        {
          label: this.$t('CALENDARWEBCLIENT.LABEL_SATURDAY'),
          value: 6
        },
        {
          label: this.$t('CALENDARWEBCLIENT.LABEL_SUNDAY'),
          value: 0
        },
        {
          label: this.$t('CALENDARWEBCLIENT.LABEL_MONDAY'),
          value: 1
        },
      ]
    }
  },

  mounted () {
    this.populate()
  },

  beforeRouteLeave (to, from, next) {
    this.$root.doBeforeRouteLeave(to, from, next)
  },

  methods: {
    /**
     * Method is used in doBeforeRouteLeave mixin
     */
    hasChanges () {
      const data = settings.getCalendarSettings()
      return this.highlightWorkingDays !== data.highlightWorkingDays ||
          this.highlightWorkingHours !== data.highlightWorkingHours ||
          this.workdayEnds.value !== data.workdayEnds ||
          this.workdayStarts.value !== data.workdayStarts ||
          this.timeFormat !== data.defaultTab ||
          this.weekStartsOn.value !== data.weekStartsOn
    },

    /**
     * Method is used in doBeforeRouteLeave mixin,
     * do not use async methods - just simple and plain reverting of values
     * !! hasChanges method must return true after executing revertChanges method
     */
    revertChanges () {
      this.populate()
    },

    populate () {
      const data = settings.getCalendarSettings()
      this.highlightWorkingDays = data.highlightWorkingDays
      this.highlightWorkingHours = data.highlightWorkingHours
      this.workdayEnds = this.chooseTime(data.workdayEnds, this.timeList)
      this.workdayStarts = this.chooseTime(data.workdayStarts, this.timeList)
      this.timeFormat = data.defaultTab
      this.weekStartsOn = this.chooseTime(data.weekStartsOn, this.weekStartsList)
    },
    save () {
      if (!this.saving) {
        this.saving = true
        const parameters = {
          HighlightWorkingDays: this.highlightWorkingDays,
          HighlightWorkingHours: this.highlightWorkingHours,
          WorkdayStarts: this.workdayStarts.value,
          WorkdayEnds: this.workdayEnds.value,
          WeekStartsOn: this.weekStartsOn.value,
          DefaultTab: this.timeFormat
        }
        webApi.sendRequest({
          moduleName: 'Calendar',
          methodName: 'UpdateSettings',
          parameters,
        }).then(result => {
          this.saving = false
          if (result === true) {
            settings.saveCalendarSettings({
              highlightWorkingDays: this.highlightWorkingDays,
              highlightWorkingHours: this.highlightWorkingHours,
              workdayStarts: this.workdayStarts.value,
              workdayEnds: this.workdayEnds.value,
              weekStartsOn: this.weekStartsOn.value,
              defaultTab: this.timeFormat
            })
            this.populate()
            notification.showReport(this.$t('COREWEBCLIENT.REPORT_SETTINGS_UPDATE_SUCCESS'))
          } else {
            notification.showError(this.$t('COREWEBCLIENT.ERROR_SAVING_SETTINGS_FAILED'))
          }
        }, response => {
          this.saving = false
          notification.showError(errors.getTextFromResponse(response, this.$t('COREWEBCLIENT.ERROR_SAVING_SETTINGS_FAILED')))
        })
      }
    },
    chooseTime (timeValue, timeList) {
      return timeList.find(elem => elem.value === timeValue)
    },
  }
}
</script>

<style scoped>
.select {
  border-radius: 6px;
}
</style>
