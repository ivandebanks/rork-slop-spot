import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Camera,
  Sparkles,
  Shield,
  Star,
  Heart,
  ChevronRight,
  ArrowLeft,
  Check,
  Search,
  Zap,
  Award,
  Users,
  Lock,
  BookOpen,
  Leaf,
  Eye,
  Crown,
  ShoppingCart,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Preview Photo 1: Click Image (Hero - Curiosity)
function HeroPreview() {
  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#0A1628", "#118AB2", "#06D6A0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconRow}>
            <View style={styles.heroIconCircle}>
              <Camera size={40} color="#FFFFFF" />
            </View>
            <View style={styles.heroArrow}>
              <Sparkles size={24} color="#FFD700" />
            </View>
            <View style={[styles.heroIconCircle, { backgroundColor: "#06D6A0" }]}>
              <Check size={40} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Scan Any Label.{"\n"}Know What's Inside.
          </Text>

          <Text style={styles.heroSubtitle}>
            Point your camera at any food, drink, or product label and get instant ingredient analysis
          </Text>

          <View style={styles.heroMockup}>
            <View style={styles.phoneMockup}>
              <View style={styles.phoneScreen}>
                <View style={styles.mockCameraView}>
                  <Text style={styles.mockCameraTitle}>Kiwi</Text>
                  <View style={styles.mockScanFrame} />
                  <View style={styles.mockCaptureBtn}>
                    <Sparkles size={20} color="#118AB2" />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroBadge}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.heroBadgeText}>Free to Download</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 2: Ingredients
function IngredientsPreview() {
  const mockIngredients = [
    { name: "Organic Oats", score: 95, color: "#118AB2" },
    { name: "Honey", score: 72, color: "#06D6A0" },
    { name: "Natural Flavors", score: 55, color: "#FCBF49" },
    { name: "Citric Acid", score: 68, color: "#FCBF49" },
    { name: "High Fructose Corn Syrup", score: 15, color: "#E63946" },
  ];

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#FFFFFF", "#F0F9FF", "#E0F2FE"]}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.slideHeader}>
            <View style={[styles.slideIconBadge, { backgroundColor: "#118AB2" }]}>
              <Search size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.slideTitleDark}>Every Ingredient,{"\n"}Analyzed Instantly</Text>
            <Text style={styles.slideSubtitleDark}>
              AI-powered breakdown with health scores for each ingredient
            </Text>
          </View>

          <View style={styles.ingredientsList}>
            {mockIngredients.map((item, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={[styles.ingredientDot, { backgroundColor: item.color }]} />
                <Text style={styles.ingredientName}>{item.name}</Text>
                <View style={[styles.ingredientScoreBadge, { backgroundColor: item.color + "20" }]}>
                  <Text style={[styles.ingredientScore, { color: item.color }]}>{item.score}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.scoreScale}>
            <View style={styles.scaleBar}>
              <LinearGradient
                colors={["#E63946", "#F77F00", "#FCBF49", "#06D6A0", "#118AB2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scaleGradient}
              />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>Harmful</Text>
              <Text style={styles.scaleLabel}>Excellent</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 3: Benefits
function BenefitsPreview() {
  const benefits = [
    {
      icon: <Camera size={28} color="#118AB2" />,
      title: "Instant Scanning",
      desc: "Point & scan any label in seconds",
    },
    {
      icon: <Zap size={28} color="#F77F00" />,
      title: "AI-Powered Analysis",
      desc: "Smart ingredient health ratings 0-100",
    },
    {
      icon: <Shield size={28} color="#06D6A0" />,
      title: "Science-Backed",
      desc: "Citations from FDA, NIH & medical journals",
    },
    {
      icon: <BookOpen size={28} color="#9B59B6" />,
      title: "Track History",
      desc: "Save & compare all your scanned products",
    },
  ];

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#0A1628", "#1A2940", "#0D3B66"]}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.slideHeader}>
            <Text style={styles.slideTitle}>Why People{"\n"}Love Kiwi</Text>
            <Text style={styles.slideSubtitle}>
              Everything you need to make healthier choices
            </Text>
          </View>

          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIconWrap}>
                  {benefit.icon}
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 4: Product Details
function ProductDetailsPreview() {
  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA", "#EEF2FF"]}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.slideHeader}>
            <View style={[styles.slideIconBadge, { backgroundColor: "#06D6A0" }]}>
              <Award size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.slideTitleDark}>Detailed Product{"\n"}Health Reports</Text>
          </View>

          <View style={styles.mockResultCard}>
            <View style={styles.mockProductHeader}>
              <View style={[styles.mockScoreCircle, { backgroundColor: "#06D6A0" }]}>
                <Text style={styles.mockScoreNum}>82</Text>
                <Text style={styles.mockScoreOf}>/100</Text>
              </View>
              <Text style={styles.mockGradeLabel}>B Grade</Text>
              <Text style={styles.mockProductName}>Organic Granola Bar</Text>
            </View>

            <View style={styles.mockDivider} />

            <View style={styles.mockDetailRow}>
              <Text style={styles.mockDetailLabel}>Ingredients Analyzed</Text>
              <Text style={styles.mockDetailValue}>12</Text>
            </View>
            <View style={styles.mockDetailRow}>
              <Text style={styles.mockDetailLabel}>Health Impact</Text>
              <View style={styles.mockImpactBadge}>
                <Text style={styles.mockImpactText}>Mostly Healthy</Text>
              </View>
            </View>
            <View style={styles.mockDetailRow}>
              <Text style={styles.mockDetailLabel}>Scientific Sources</Text>
              <Text style={styles.mockDetailValue}>8 citations</Text>
            </View>

            <View style={styles.mockCitationPreview}>
              <View style={styles.mockCitationDot} />
              <Text style={styles.mockCitationText}>FDA - Generally Recognized as Safe</Text>
            </View>
            <View style={styles.mockCitationPreview}>
              <View style={styles.mockCitationDot} />
              <Text style={styles.mockCitationText}>NIH - Nutritional Benefits Study</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 5: Lifestyle
function LifestylePreview() {
  const scenarios = [
    { emoji: "🛒", title: "At the Grocery Store", desc: "Compare products before you buy" },
    { emoji: "🍽️", title: "Meal Planning", desc: "Choose healthier ingredients" },
    { emoji: "👨‍👩‍👧‍👦", title: "For Your Family", desc: "Know what your kids are eating" },
    { emoji: "💪", title: "Fitness Goals", desc: "Track nutritional quality" },
  ];

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#06D6A0", "#118AB2", "#0D3B66"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.slideHeader}>
            <Text style={styles.slideTitle}>Scan Anywhere,{"\n"}Anytime</Text>
            <Text style={styles.slideSubtitle}>
              Make informed choices in every moment
            </Text>
          </View>

          <View style={styles.lifestyleCards}>
            {scenarios.map((item, index) => (
              <View key={index} style={styles.lifestyleCard}>
                <Text style={styles.lifestyleEmoji}>{item.emoji}</Text>
                <View style={styles.lifestyleTextWrap}>
                  <Text style={styles.lifestyleCardTitle}>{item.title}</Text>
                  <Text style={styles.lifestyleCardDesc}>{item.desc}</Text>
                </View>
                <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
              </View>
            ))}
          </View>

          <View style={styles.lifestyleStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2M+</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 6: Trust
function TrustPreview() {
  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#FFFFFF", "#F0FDF4", "#ECFDF5"]}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.slideHeader}>
            <View style={[styles.slideIconBadge, { backgroundColor: "#06D6A0" }]}>
              <Shield size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.slideTitleDark}>Built on Trust{"\n"}& Transparency</Text>
          </View>

          <View style={styles.trustCards}>
            <View style={styles.trustCard}>
              <Lock size={24} color="#118AB2" />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>100% Private</Text>
                <Text style={styles.trustCardDesc}>All scanning happens on your device. No photos uploaded to any server.</Text>
              </View>
            </View>

            <View style={styles.trustCard}>
              <BookOpen size={24} color="#06D6A0" />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>Science-Backed Sources</Text>
                <Text style={styles.trustCardDesc}>Every rating links to FDA, NIH, WHO, and peer-reviewed research.</Text>
              </View>
            </View>

            <View style={styles.trustCard}>
              <Eye size={24} color="#9B59B6" />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>Full Transparency</Text>
                <Text style={styles.trustCardDesc}>See exactly why each ingredient received its score.</Text>
              </View>
            </View>

            <View style={styles.trustCard}>
              <Users size={24} color="#F77F00" />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>No Account Required</Text>
                <Text style={styles.trustCardDesc}>Start scanning immediately. No sign-up, no personal data collected.</Text>
              </View>
            </View>
          </View>

          <View style={styles.trustStars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={24} color="#FFD700" fill={i <= 4 ? "#FFD700" : "transparent"} />
            ))}
            <Text style={styles.trustRating}>4.0 on the App Store</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Preview Photo 7: Brand Story
function BrandStoryPreview() {
  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={["#0D3B66", "#118AB2", "#06D6A0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <View style={styles.slideContent}>
          <View style={styles.brandHeader}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Kiwi</Text>
            <Text style={styles.brandTagline}>Better Health Scanner</Text>
          </View>

          <View style={styles.brandMission}>
            <Leaf size={20} color="#06D6A0" />
            <Text style={styles.brandMissionText}>
              We believe everyone deserves to know what's in their food. Kiwi was built to make ingredient transparency simple, instant, and accessible to all.
            </Text>
          </View>

          <View style={styles.brandValues}>
            <View style={styles.brandValueItem}>
              <View style={[styles.brandValueDot, { backgroundColor: "#06D6A0" }]} />
              <Text style={styles.brandValueText}>Transparency First</Text>
            </View>
            <View style={styles.brandValueItem}>
              <View style={[styles.brandValueDot, { backgroundColor: "#118AB2" }]} />
              <Text style={styles.brandValueText}>Privacy by Design</Text>
            </View>
            <View style={styles.brandValueItem}>
              <View style={[styles.brandValueDot, { backgroundColor: "#FFD700" }]} />
              <Text style={styles.brandValueText}>Science-Backed Ratings</Text>
            </View>
            <View style={styles.brandValueItem}>
              <View style={[styles.brandValueDot, { backgroundColor: "#9B59B6" }]} />
              <Text style={styles.brandValueText}>Accessible to Everyone</Text>
            </View>
          </View>

          <View style={styles.brandCta}>
            <View style={styles.brandCtaButton}>
              <Text style={styles.brandCtaText}>Download Free Today</Text>
              <ShoppingCart size={18} color="#118AB2" />
            </View>
            <View style={styles.brandPricing}>
              <Text style={styles.brandFreeText}>Free with 2 daily scans</Text>
              <Text style={styles.brandPremiumText}>Premium: $4.99 one-time</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const previewSlides = [
  { key: "hero", label: "1. Click Image", component: HeroPreview },
  { key: "ingredients", label: "2. Ingredients", component: IngredientsPreview },
  { key: "benefits", label: "3. Benefits", component: BenefitsPreview },
  { key: "details", label: "4. Product Details", component: ProductDetailsPreview },
  { key: "lifestyle", label: "5. Lifestyle", component: LifestylePreview },
  { key: "trust", label: "6. Trust", component: TrustPreview },
  { key: "brand", label: "7. Brand Story", component: BrandStoryPreview },
];

export default function PreviewPhotosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>App Store Previews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {previewSlides.map((slide) => (
          <View key={slide.key} style={styles.slideWrapper}>
            <Text style={styles.slideLabel}>{slide.label}</Text>
            <slide.component />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  slideWrapper: {
    width: SCREEN_WIDTH - 32,
    marginRight: 16,
    alignItems: "center",
  },
  slideLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  slide: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.78,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  gradientBg: {
    flex: 1,
  },

  // Hero styles
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  heroIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#118AB2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroArrow: {
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  heroMockup: {
    alignItems: "center",
    marginTop: 8,
  },
  phoneMockup: {
    width: 180,
    height: 200,
    borderRadius: 24,
    backgroundColor: "#000000",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  mockCameraView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  mockCameraTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  mockScanFrame: {
    width: 100,
    height: 80,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  mockCaptureBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Shared slide styles
  slideContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  slideHeader: {
    alignItems: "center",
    gap: 12,
  },
  slideIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
  },
  slideSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  slideTitleDark: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 38,
  },
  slideSubtitleDark: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },

  // Ingredients styles
  ingredientsList: {
    gap: 12,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  ingredientScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ingredientScore: {
    fontSize: 15,
    fontWeight: "700",
  },
  scoreScale: {
    marginTop: 8,
  },
  scaleBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  scaleGradient: {
    flex: 1,
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  scaleLabel: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "500",
  },

  // Benefits styles
  benefitsGrid: {
    gap: 14,
    marginTop: 8,
  },
  benefitCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },

  // Product Details styles
  mockResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  mockProductHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  mockScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mockScoreNum: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  mockScoreOf: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginTop: -4,
  },
  mockGradeLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#06D6A0",
    marginBottom: 4,
  },
  mockProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  mockDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  mockDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  mockDetailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  mockDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  mockImpactBadge: {
    backgroundColor: "#06D6A020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mockImpactText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#06D6A0",
  },
  mockCitationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 6,
  },
  mockCitationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#118AB2",
  },
  mockCitationText: {
    fontSize: 12,
    color: "#118AB2",
    fontWeight: "500",
  },

  // Lifestyle styles
  lifestyleCards: {
    gap: 12,
    marginTop: 8,
  },
  lifestyleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 14,
  },
  lifestyleEmoji: {
    fontSize: 32,
  },
  lifestyleTextWrap: {
    flex: 1,
    gap: 2,
  },
  lifestyleCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  lifestyleCardDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  lifestyleStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Trust styles
  trustCards: {
    gap: 12,
  },
  trustCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    alignItems: "flex-start",
  },
  trustCardText: {
    flex: 1,
    gap: 4,
  },
  trustCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  trustCardDesc: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  trustStars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  trustRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },

  // Brand Story styles
  brandHeader: {
    alignItems: "center",
    gap: 8,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  brandTagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  brandMission: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "flex-start",
  },
  brandMissionText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  brandValues: {
    gap: 12,
  },
  brandValueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandValueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandValueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  brandCta: {
    alignItems: "center",
    gap: 12,
  },
  brandCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  brandCtaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#118AB2",
  },
  brandPricing: {
    alignItems: "center",
    gap: 2,
  },
  brandFreeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  brandPremiumText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
});
