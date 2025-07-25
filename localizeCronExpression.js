function isNumber (n) => typeof n === 'number' || (typeof n === 'string' && n.trim() !== '' && !isNaN(Number(n)))

export function LocalizeCronExpression (cron, offset=0, options={}) {
    //Offset in minutes
    offset = Number(offset ?? options?.tzOffset) ?? 0 

    if( !offset || !isNumber(offset) ) return cron

    const posorneg = offset < 0 ? -1 : 1
    const offset_h = Math.floor(Math.abs(offset) / 60) * posorneg   //Initial hour offset
    const offset_m = Math.floor(Math.abs(offset) % 60) * posorneg   //Initial minute offset

    let [ second, minute, hour, day, month, weekday ] = cron.split(/\s+/g) || []
    let offset_H = 0                                                //Hour offset adjust
    let offset_D = 0                                                //Days offset adjust
    let offset_M = 0                                                //Month offset adjust

    if( offset_m ) {
        //Break the minutes into its piece
        const minutes = minute.match(/(\d+|,|\-|\*|\/)/g) || ['*']  // number, comma, dash, star, slash
        for(let i = 0; i < minutes.length; ++i) {
            //If not a number nothing to offset
            if( !isNumber(minutes[i]) ) continue

            //Offset every number
            minutes[i] = Number(minutes[i]) + offset_m

            //If minutes wrapped an hour, adjust minutes and offset hour
            if( minutes[i] < 0 ) {
                minutes[i] += 60
                offset_H = -1   //prev hour
            } else if( minutes[i] >= 60 ) {
                minutes[i] -= 60
                offset_H = 1    //next hour
            }
        }
        //Set adjusted minute
        minute = minutes.join('')
    }

    if( offset_h ) {
        //Break the hours into its pieces
        const hours = hour.match(/(\d+|,|\-|\*|\/)/g) || ['*']  // number, comma, dash, star, slash
        for(let i = 0; i < hours.length; ++i) {
            //If not a number nothing to offset
            if( !isNumber(hours[i]) ) continue 

            //Offset every number
            hours[i] = Number(hours[i]) + offset_h + offset_H

            //If hours wrapped a day, adjust hour and offset day
            if( hours[i] < 0 ) {
                hours[i] += 24
                offset_D = -1   //prev day
            } else if( hours[i] >= 24 ) {
                hours[i] -= 24
                offset_D = 1    //next day
            }
        }
        //Set adjusted hour
        hour = hours.join('')
    }

    if( offset_D ) {
        const WEEKDAYS_INDEX = !!options?.dayOfWeekStartIndexZero ? 1 : 0
        const WEEKDAYS = ["","sun","mon","tue","wed","thu","fri","sat"].slice(WEEKDAYS_INDEX)
        
        //Break the weekday into its pieces
        const weekdays = weekday.match(/(\w{3}|\d|L|,|\-|\*|\/|\?)/g) || ['*']  // abbr, single-digit, last, comma, dash, star, slash, questionmark
        for(let i = 0; i < weekdays.length; ++i) {
            if( !isNumber(weekdays[i]) ) {
                //If not a number nothing to offset
                if( weekdays[i].length <= 1 ) continue
                const w = WEEKDAYS.indexOf(weekdays[i])
                if( w < 0 ) continue

                //Change month abbr into number
                weekdays[i] = w
            }
            
            //Offset every number
            weekdays[i] = Number(weekdays[i]) + offset_D

            //If weekday wrapped a week, adjust weekday
            if( weekdays[i] < 1 ) {
                weekdays[i] += 7
            } else if( weekdays[i] > 7 ) {
                weekdays[i] -= 7
            }                
        }
        weekday = weekdays.join('')
        

        //Break the day into its pieces
        const days = day.match(/(L\-\d|L|\d+|,|\-|\*|\/|\?)/g) || ['*']  // last-with-offset, last, number, comma, dash, star, slash, questionmark
        for(let i = 0; i < days.length; ++i) {
            if( isNumber(days[i]) ) {
                //Offset every number
                days[i] = Number(days[i]) + offset_D

                //If days wrapped back a month, adjust month
                if( days[i] === 0 ) {
                    days[i] = `L`
                    offset_M = -1   //prev month
                } else if( days[i] < 0 ) {
                    days[i] = `L${days[i]}`
                    offset_M = -1   //prev month
                }
            } else if( days[i] === "L" ) {
                if( offset_D > 0 ) {
                    days[i] = offset_D
                    offset_M = 1    //next month
                } else {
                    days[i] = `L${offset_D}`
                    offset_M = 0    //same month
                }
            } else if( days[i].startsWith("L") ) {
                let num = Number(days[i].slice(1)) + offset_D
                if( num === 0 ) {
                    days[i] = `L`
                    offset_M = 0    //same month
                } else if( num > 0 ) {
                    days[i] = num
                    offset_M = 1    //next month
                } else {
                    days[i] = `L${num}`
                    offset_M = 0    //same month
                }
            }

        }
        //Set adjusted minute
        day = days.join('')
    }

    if( offset_M ) {
        const MONTHS_INDEX = !!options?.monthStartIndexZero ? 1 : 0
        const MONTHS = ["","jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].slice(MONTHS_INDEX)
        
        //Break the minutes into its piece
        const months = month.match(/(\w{3}|\d+|,|\-|\*|\/)/g) || ['*']  // abbr, number, comma, dash, star, slash
        for(let i = 0; i < months.length; ++i) {
            if( !isNumber(months[i]) ) {
                //If not a number nothing to offset
                if( months[i].length <= 1 ) continue
                const m = MONTHS.indexOf(months[i])
                if( m < 0 ) continue

                //Change month abbr into number
                months[i] = m
            }

            //Offset every number
            months[i] = Number(months[i]) + offset_M

            //If minutes wrapped an hour, adjust minutes
            if( months[i] < 1 ) {
                months[i] += 12
            } else if( months[i] > 12 ) {
                months[i] -= 12
            }
        }
        //Set adjusted minute
        month = months.join('')
    }

    return [second, minute, hour, day, month, weekday].join(' ')
}
