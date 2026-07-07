import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Linking,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

const GRADE_OPTIONS = ["8-10", "11-13", "14-16", "17+"] as const;
const SUBJECT_OPTIONS = ["Math", "History", "Biology", "English"] as const;
const ONBOARDING_STEPS = [
  "welcome",
  "grade",
  "subjects",
  "permission",
  "save",
] as const;

type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
type PermissionState =
  "idle" | "requesting" | "approved" | "denied" | "unavailable";

async function requestScreenTimeAuthorization(): Promise<PermissionState> {
  if (Platform.OS !== "ios") {
    return "unavailable";
  }

  const module = (
    NativeModules as {
      EarnlockScreentime?: { requestAuthorization?: () => Promise<unknown> };
    }
  ).EarnlockScreentime;

  if (!module?.requestAuthorization) {
    return "unavailable";
  }

  try {
    const result = await module.requestAuthorization();
    if (result === "approved" || result === true) {
      return "approved";
    }

    return "denied";
  } catch {
    return "denied";
  }
}

async function saveProfile(gradeOrAge: string, focusSubjects: string[]) {
  const baseUrl =
    process.env.EXPO_PUBLIC_EARNLOCK_API_URL?.replace(/\/$/, "") ??
    "http://localhost:5000";
  const authToken = process.env.EXPO_PUBLIC_EARNLOCK_AUTH_TOKEN;

  const response = await fetch(`${baseUrl}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: "Bearer " + authToken } : {}),
    },
    body: JSON.stringify({
      grade_or_age: gradeOrAge,
      focus_subjects: focusSubjects,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Could not save your profile. Please try again.",
    );
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [gradeOrAge, setGradeOrAge] = useState<string | null>(null);
  const [focusSubjects, setFocusSubjects] = useState<string[]>([]);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;
  const progress = `${stepIndex + 1}/${ONBOARDING_STEPS.length}`;
  const canContinueFromPermission =
    permissionState === "approved" || permissionState === "unavailable";

  const permissionMessage = useMemo(() => {
    if (permissionState === "denied") {
      return "Screen Time access is required to lock and unlock apps. Please enable it in Settings and try again.";
    }
    if (permissionState === "approved") {
      return "Screen Time access granted.";
    }
    if (permissionState === "unavailable") {
      return "Screen Time permission is only available on iOS devices with the native module installed.";
    }
    return "We use Screen Time permission to lock distracting apps while you study.";
  }, [permissionState]);

  const goNext = () =>
    setStepIndex((current) =>
      Math.min(current + 1, ONBOARDING_STEPS.length - 1),
    );

  const toggleSubject = (subject: string) =>
    setFocusSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject],
    );

  const handlePermissionRequest = async () => {
    setPermissionState("requesting");
    const nextState = await requestScreenTimeAuthorization();
    setPermissionState(nextState);
  };

  const handleSave = async () => {
    if (!gradeOrAge || focusSubjects.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveProfile(gradeOrAge, focusSubjects);
      router.replace("/explore");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            Onboarding {progress}
          </ThemedText>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {step === "welcome" && (
              <View style={styles.section}>
                <AnimatedIcon />
                <ThemedText type="subtitle" style={styles.title}>
                  Study smart, earn screen time.
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.centerText}
                >
                  EarnLock helps you turn focused study sessions into screen
                  time rewards.
                </ThemedText>
              </View>
            )}

            {step === "grade" && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.title}>
                  Choose your grade/age
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.centerText}
                >
                  We use this to tailor quiz difficulty.
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {GRADE_OPTIONS.map((option) => {
                    const selected = gradeOrAge === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setGradeOrAge(option)}
                        style={({ pressed }) => [
                          styles.optionButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <ThemedView
                          type={
                            selected
                              ? "backgroundSelected"
                              : "backgroundElement"
                          }
                          style={styles.optionFill}
                        >
                          <ThemedText>{option}</ThemedText>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === "subjects" && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.title}>
                  Pick focus subjects
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.centerText}
                >
                  Select one or more subjects for your first quiz plan.
                </ThemedText>
                <View style={styles.optionsGrid}>
                  {SUBJECT_OPTIONS.map((subject) => {
                    const selected = focusSubjects.includes(subject);
                    return (
                      <Pressable
                        key={subject}
                        onPress={() => toggleSubject(subject)}
                        style={({ pressed }) => [
                          styles.optionButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <ThemedView
                          type={
                            selected
                              ? "backgroundSelected"
                              : "backgroundElement"
                          }
                          style={styles.optionFill}
                        >
                          <ThemedText>{subject}</ThemedText>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === "permission" && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.title}>
                  Enable Screen Time access
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.centerText}
                >
                  {permissionMessage}
                </ThemedText>

                <Pressable
                  onPress={handlePermissionRequest}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    type="backgroundElement"
                    style={styles.secondaryButton}
                  >
                    <ThemedText>
                      {permissionState === "requesting"
                        ? "Requesting access…"
                        : "Request Screen Time Access"}
                    </ThemedText>
                  </ThemedView>
                </Pressable>

                {permissionState === "denied" && (
                  <Pressable
                    onPress={() => Linking.openSettings()}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <ThemedView
                      type="backgroundElement"
                      style={styles.secondaryButton}
                    >
                      <ThemedText>Open Settings</ThemedText>
                    </ThemedView>
                  </Pressable>
                )}
              </View>
            )}

            {step === "save" && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.title}>
                  Save your profile
                </ThemedText>
                <ThemedView type="backgroundElement" style={styles.summaryCard}>
                  <ThemedText type="small">Grade/Age: {gradeOrAge}</ThemedText>
                  <ThemedText type="small">
                    Subjects: {focusSubjects.join(", ")}
                  </ThemedText>
                </ThemedView>
                {!!saveError && (
                  <ThemedText type="small" style={styles.errorText}>
                    {saveError}
                  </ThemedText>
                )}
              </View>
            )}
          </ScrollView>

          {step !== "save" && (
            <Pressable
              onPress={goNext}
              disabled={
                (step === "grade" && !gradeOrAge) ||
                (step === "subjects" && focusSubjects.length === 0) ||
                (step === "permission" && !canContinueFromPermission)
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedView
                type="backgroundSelected"
                style={styles.primaryButtonFill}
              >
                <ThemedText>
                  {step === "welcome"
                    ? "Get Started"
                    : step === "permission"
                      ? "Continue"
                      : "Next"}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}

          {step === "save" && (
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedView
                type="backgroundSelected"
                style={styles.primaryButtonFill}
              >
                <ThemedText>
                  {isSaving ? "Saving…" : "Save and go to dashboard"}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: "100%",
    paddingBottom: BottomTabInset + Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.three,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  centerText: {
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.two,
  },
  optionButton: {
    width: "48%",
    minWidth: 140,
  },
  optionFill: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  summaryCard: {
    alignSelf: "stretch",
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  primaryButton: {
    alignSelf: "stretch",
  },
  primaryButtonFill: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: "center",
    minWidth: 240,
  },
  pressed: {
    opacity: 0.7,
  },
  errorText: {
    textAlign: "center",
    color: "#D70015",
  },
});
