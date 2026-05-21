"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { Calendar } from "@kononia/ui/components/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@kononia/ui/components/card";
import { Button } from "@kononia/ui/components/button";
import { Badge } from "@kononia/ui/components/badge";
import { Spinner } from "@/components/spinner";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { FASTING_COLORS, MEAL_TYPES, QUERY_LIMITS } from "@kononia/ui/lib/constants";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
} from "@/components/credenza";

const FASTING_TYPE_CONFIG: Record<string, { bg: string; label: string; textClass: string; borderColor: string }> = {
  strict: { 
    bg: FASTING_COLORS.strict.bg, 
    label: "Strict Fast", 
    textClass: FASTING_COLORS.strict.text,
    borderColor: "border-[var(--fast-strict)]"
  },
  regular: { 
    bg: FASTING_COLORS.regular.bg, 
    label: "Regular Fast", 
    textClass: FASTING_COLORS.regular.text,
    borderColor: "border-[var(--fast-regular)]"
  },
  feast: { 
    bg: FASTING_COLORS.feast.bg, 
    label: "Feast Day", 
    textClass: FASTING_COLORS.feast.text,
    borderColor: "border-[var(--fast-feast)]"
  },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const { data: session } = authClient.useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPickerOpen, setMealPickerOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>("lunch");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; mealType: string; mealName: string } | null>(null);
  const [editMealType, setEditMealType] = useState("lunch");
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  
  const { data: fastDays, isLoading: fastDaysLoading } = trpc.calendar.getFastDaysInRange.useQuery({ 
    startDate, 
    endDate 
  });

  const { data: selectedDayData, isLoading: selectedDayLoading } = trpc.calendar.getFastDay.useQuery(
    { date: selectedDate.toISOString().split("T")[0] },
    { enabled: !!selectedDate }
  );

  const { data: currentSeason } = trpc.seasons.getCurrent.useQuery();

  const { data: dayMealPlans } = trpc.mealPlan.getByDate.useQuery(
    { date: selectedDate.toISOString().split("T")[0] },
    { enabled: !!session }
  );

  const { data: monthMealPlans } = trpc.mealPlan.getByDateRange.useQuery(
    { startDate, endDate },
    { enabled: !!session }
  );

  const { data: fastingTypeMeals } = trpc.meals.getByFastingType.useQuery({
    fastingType: selectedDayData?.fastingType === "feast" ? "both" : selectedDayData?.fastingType || "regular",
    limit: QUERY_LIMITS.mealPicker,
  });

  const createMealPlan = trpc.mealPlan.create.useMutation({
    onSuccess: () => {
      setMealPickerOpen(false);
    },
  });

  const deleteMealPlan = trpc.mealPlan.delete.useMutation({
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const updateMealPlan = trpc.mealPlan.update.useMutation({
    onSuccess: () => {
      setEditTarget(null);
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMealPlan.mutate({ id: deleteTarget });
    }
  };

  const handleEditMeal = () => {
    if (editTarget) {
      updateMealPlan.mutate({ id: editTarget.id, mealType: editMealType as "breakfast" | "lunch" | "dinner" | "snack" });
    }
  };

  const fastingDaysMap = useMemo(() => {
    const map = new Map<string, { fastingType: string; fastNotes: string | null }>();
    (fastDays || []).forEach(day => {
      map.set(day.date, { fastingType: day.fastingType, fastNotes: day.fastNotes });
    });
    return map;
  }, [fastDays]);

  const mealPlansMap = useMemo(() => {
    const map = new Map<string, number>();
    (monthMealPlans || []).forEach(plan => {
      const count = map.get(plan.date) || 0;
      map.set(plan.date, count + 1);
    });
    return map;
  }, [monthMealPlans]);

  const getFastingType = (date: Date): string | null => {
    const dateStr = date.toISOString().split("T")[0];
    return fastingDaysMap.get(dateStr)?.fastingType || null;
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) setSelectedDate(date);
  };

  const handleAddMeal = (mealId: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    createMealPlan.mutate({
      date: dateStr,
      mealId,
      mealType: selectedMealType as "breakfast" | "lunch" | "dinner" | "snack",
    });
  };

  const today = new Date();
  const selectedType = selectedDayData?.fastingType;
  const selectedConfig = selectedType ? FASTING_TYPE_CONFIG[selectedType] : null;
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 text-center">
        <p className="text-muted-foreground">Please sign in to view the calendar.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Fasting Calendar</h1>
        {currentSeason && (
          <Badge className={`${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text}`}>
            {currentSeason.name}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">
            {MONTHS[month]} {year}
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon-sm"
              onClick={() => handleMonthChange(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon-sm"
              onClick={() => handleMonthChange(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fastDaysLoading ? (
            <div className="flex justify-center py-8">
              <Spinner text="Loading calendar..." />
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              className="w-full"
              modifiers={{
                strictFast: (date) => getFastingType(date) === "strict",
                regularFast: (date) => getFastingType(date) === "regular",
                feast: (date) => getFastingType(date) === "feast",
                hasMeals: (date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return (mealPlansMap.get(dateStr) || 0) > 0;
                },
              }}
              modifiersClassNames={{
                strictFast: `${FASTING_COLORS.strict.bg} ${FASTING_COLORS.strict.text} rounded-full`,
                regularFast: `${FASTING_COLORS.regular.bg} ${FASTING_COLORS.regular.text} rounded-full`,
                feast: `${FASTING_COLORS.feast.bg} ${FASTING_COLORS.feast.text} rounded-full`,
                hasMeals: "ring-2 ring-[var(--fast-regular)] ring-offset-2",
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--fast-strict)" }} />
          <span className="text-sm">Strict Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--fast-regular)" }} />
          <span className="text-sm">Regular Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--fast-feast)" }} />
          <span className="text-sm">Feast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "var(--fast-strict)" }} />
          <span className="text-sm">Planned Meals</span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {selectedDate.toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </CardTitle>
          <Button size="sm" onClick={() => setMealPickerOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Meal
          </Button>
        </CardHeader>
        <CardContent>
          {selectedDayLoading ? (
            <Spinner text="Loading..." />
          ) : (
            <div className="space-y-4">
              {selectedConfig ? (
                <div className="flex items-center gap-3">
                  <div className={`inline-block px-4 py-2 rounded font-medium ${selectedConfig.bg} ${selectedConfig.textClass}`}>
                    {selectedConfig.label}
                  </div>
                  {selectedDayData?.fastNotes && (
                    <p className="text-muted-foreground">{selectedDayData.fastNotes}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground font-medium">Regular Fast</p>
                  <p className="text-sm text-muted-foreground">
                    No meat, dairy, eggs, olive oil, wine, avocado, nuts, or seeds
                  </p>
                </div>
              )}

              {dayMealPlans && dayMealPlans.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Planned Meals</p>
                  <div className="space-y-2">
                    {dayMealPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-2 rounded bg-muted">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">{plan.mealType}</Badge>
                          <button
                            onClick={() => { setEditTarget({ id: plan.id, mealType: plan.mealType, mealName: plan.meal.name }); setEditMealType(plan.mealType); }}
                            className="hover:text-[var(--fast-strict)] text-sm text-left cursor-pointer"
                          >
                            {plan.meal.name}
                          </button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteTarget(plan.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dayMealPlans && dayMealPlans.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">No meals planned yet. Click "+ Add Meal" to plan your meals.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Credenza open={mealPickerOpen} onOpenChange={setMealPickerOpen}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Add Meal</CredenzaTitle>
            <CredenzaDescription>
              Choose a meal type and select a meal for {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="flex gap-2 flex-wrap mb-4">
              {MEAL_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedMealType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMealType(type.value)}
                  className={selectedMealType === type.value ? "bg-[var(--fast-strict)]" : ""}
                >
                  {type.label}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {fastingTypeMeals?.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer"
                  onClick={() => handleAddMeal(meal.id)}
                >
                  <div>
                    <p className="font-medium text-sm">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.cuisineTag}</p>
                  </div>
                  <Button variant="ghost" size="sm">+</Button>
                </div>
              )) || <p className="text-sm text-muted-foreground">Loading meals...</p>}
            </div>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>

      <Credenza open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Edit Meal</CredenzaTitle>
            <CredenzaDescription>
              Change meal type for {editTarget?.mealName}
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={editMealType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMealType(type.value)}
                  className={editMealType === type.value ? "bg-[var(--fast-strict)]" : ""}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditMeal}>
              Save
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      <Credenza open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Remove Meal</CredenzaTitle>
            <CredenzaDescription>
              Are you sure you want to remove this meal from your plan?
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Remove
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </div>
  );
}