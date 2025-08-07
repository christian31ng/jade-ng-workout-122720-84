import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  selectedDate: Date;
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  getTaskCount: (date: Date) => number;
}

const CustomCalendar = ({ selectedDate, currentMonth, onSelectDate, getTaskCount }: CustomCalendarProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to complete the weeks
  const startDay = monthStart.getDay(); // 0 = Sunday
  const paddingDays = [];
  
  // Add previous month's days
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (i + 1));
    paddingDays.push(date);
  }

  // Combine all days
  const allDays = [...paddingDays, ...calendarDays];

  // Add next month's days to complete the last week
  const totalCells = Math.ceil(allDays.length / 7) * 7;
  const remainingCells = totalCells - allDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    allDays.push(date);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((date, index) => {
          const taskCount = getTaskCount(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);

          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "relative h-12 w-full p-1 text-sm font-normal",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-accent text-accent-foreground border-2 border-primary",
                isTodayDate && !isSelected && "bg-primary text-primary-foreground font-bold",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onSelectDate(date)}
            >
              <div className="relative flex items-center justify-center w-full h-full">
                <span>{format(date, 'd')}</span>
                {taskCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
                    {taskCount}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;