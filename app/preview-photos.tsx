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
  ArrowLeft,
  Check,
  Star,
  Search,
  Clock,
  ChevronRight,
  Camera,
  Sparkles,
  FlipHorizontal,
  ImageIcon,
  HelpCircle,
  ZapOff,
  Shield,
  SlidersHorizontal,
  ArrowUpDown,
  Trash2,
  Settings,
  Crown,
  Package,
  ExternalLink,
  Share2,
  Info,
  X,
  Leaf,
  Lock,
  Eye,
  BookOpen,
  Users,
  Zap,
  Heart,
  ShoppingCart,
  Award,
  Type,
  Mail,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHONE_WIDTH = SCREEN_WIDTH - 80;
const PHONE_HEIGHT = PHONE_WIDTH * 2.05;

// ─── Slide 1: CLICK IMAGE (Hero) ───
// Screenshot: Camera scanner screen
// Caption: "Scan Any Label Instantly"
function Slide1() {
  return (
    <PreviewFrame caption="Scan Any Label Instantly" subcaption="Point your camera at any food or product">
      <View style={styles.phoneScreen}>
        {/* Camera screen mockup */}
        <View style={[styles.mockScreen, { backgroundColor: "#1A1A1A" }]}>
          {/* Camera overlay */}
          <View style={styles.cameraOverlay}>
            {/* Header */}
            <View style={styles.camHeader}>
              <View style={styles.camHeaderLeft}>
                <HelpCircle size={20} color="#FFFFFF" />
              </View>
              <View style={styles.camHeaderCenter}>
                <Text style={styles.camTitle}>Kiwi</Text>
                <Text style={styles.camSubtitle}>2 scans</Text>
              </View>
              <View style={styles.camHeaderRight}>
                <ZapOff size={20} color="#FFFFFF" />
              </View>
            </View>

            {/* Scan frame */}
            <View style={styles.camScanFrame} />

            {/* Controls */}
            <View style={styles.camControls}>
              <View style={styles.camSideBtn}>
                <ImageIcon size={22} color="#FFFFFF" />
              </View>
              <View style={styles.camCaptureBtn}>
                <View style={styles.camCaptureBtnInner}>
                  <Sparkles size={24} color="#118AB2" />
                </View>
              </View>
              <View style={styles.camSideBtn}>
                <FlipHorizontal size={22} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 2: INGREDIENTS ───
// Screenshot: Result screen ingredient list
// Caption: "See Every Ingredient Rated"
function Slide2() {
  const ingredients = [
    { name: "Organic Whole Oats", score: 95, color: "#118AB2", impact: "Excellent source of fiber" },
    { name: "Raw Honey", score: 78, color: "#06D6A0", impact: "Natural sweetener with antioxidants" },
    { name: "Sunflower Oil", score: 62, color: "#FCBF49", impact: "High in omega-6 fatty acids" },
    { name: "Natural Flavors", score: 45, color: "#F77F00", impact: "Vague labeling, unknown compounds" },
    { name: "Soy Lecithin", score: 58, color: "#FCBF49", impact: "Common emulsifier, generally safe" },
  ];

  return (
    <PreviewFrame caption="See Every Ingredient Rated" subcaption="AI-powered health scores from 0-100">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Result card */}
            <View style={styles.resultCardMock}>
              <View style={[styles.scoreCircleMock, { backgroundColor: "#06D6A0" }]}>
                <Text style={styles.scoreNumMock}>74</Text>
                <Text style={styles.scoreOfMock}>/100</Text>
              </View>
              <Text style={[styles.gradeLabelMock, { color: "#06D6A0" }]}>B Grade</Text>
              <Text style={styles.productNameMock}>Nature's Path Granola</Text>

              {/* Section title */}
              <View style={styles.sectionHeaderMock}>
                <Text style={styles.sectionTitleMock}>Ingredients (5)</Text>
              </View>

              {/* Ingredient cards */}
              {ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientCardMock}>
                  <View style={styles.ingHeader}>
                    <View style={styles.ingNameRow}>
                      <View style={[styles.ingDot, { backgroundColor: ing.color }]} />
                      <Text style={styles.ingName}>{ing.name}</Text>
                    </View>
                    <View style={[styles.ingBadge, { backgroundColor: ing.color + "20" }]}>
                      <Text style={[styles.ingScore, { color: ing.color }]}>{ing.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.ingImpact}>{ing.impact}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 3: BENEFITS ───
// Screenshot: Key features showcase
// Caption: "Everything You Need to Eat Smarter"
function Slide3() {
  const benefits = [
    { icon: <Camera size={24} color="#118AB2" />, title: "Instant Scan", desc: "Just point your camera at any label" },
    { icon: <Zap size={24} color="#F77F00" />, title: "AI Analysis", desc: "Health scores 0-100 per ingredient" },
    { icon: <BookOpen size={24} color="#06D6A0" />, title: "Real Sources", desc: "FDA, NIH & peer-reviewed citations" },
    { icon: <Clock size={24} color="#9B59B6" />, title: "Track History", desc: "Save every scan, compare products" },
  ];

  return (
    <PreviewFrame caption="Everything You Need to Eat Smarter" subcaption="Powerful features, dead simple to use">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#0A1628" }]}>
          <View style={styles.benefitsLayout}>
            <View style={styles.benefitsHeader}>
              <Sparkles size={28} color="#FFD700" />
              <Text style={styles.benefitsTitle}>Why Kiwi?</Text>
            </View>

            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRowMock}>
                <View style={styles.benefitIconBox}>{b.icon}</View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitleMock}>{b.title}</Text>
                  <Text style={styles.benefitDescMock}>{b.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.benefitsBadge}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.benefitsBadgeText}>Free to download  •  No account needed</Text>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 4: PRODUCT DETAILS ───
// Screenshot: Full result detail view
// Caption: "Detailed Health Reports with Sources"
function Slide4() {
  return (
    <PreviewFrame caption="Detailed Health Reports" subcaption="With scientific citations for every rating">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Product image area */}
            <View style={styles.productImageArea}>
              <View style={styles.productImagePlaceholder}>
                <Package size={40} color="#AAAAAA" />
                <Text style={styles.productImageText}>Product Photo</Text>
              </View>
              <View style={styles.floatingBack}>
                <ArrowLeft size={18} color="#FFFFFF" />
              </View>
              <View style={styles.floatingShare}>
                <Share2 size={18} color="#FFFFFF" />
              </View>
            </View>

            {/* Result card */}
            <View style={styles.detailResultCard}>
              <View style={[styles.scoreCircleMock, { backgroundColor: "#E63946", width: 70, height: 70, borderRadius: 35 }]}>
                <Text style={[styles.scoreNumMock, { fontSize: 28 }]}>32</Text>
                <Text style={styles.scoreOfMock}>/100</Text>
              </View>
              <Text style={[styles.gradeLabelMock, { color: "#E63946" }]}>Slop</Text>
              <Text style={styles.productNameMock}>Mountain Dew Code Red</Text>

              {/* Ingredient detail */}
              <View style={styles.detailIngredient}>
                <View style={styles.ingHeader}>
                  <View style={styles.ingNameRow}>
                    <View style={[styles.ingDot, { backgroundColor: "#E63946" }]} />
                    <Text style={styles.ingName}>High Fructose Corn Syrup</Text>
                  </View>
                  <View style={[styles.ingBadge, { backgroundColor: "#E6394620" }]}>
                    <Text style={[styles.ingScore, { color: "#E63946" }]}>12</Text>
                  </View>
                </View>
                <Text style={styles.ingImpactBold}>Linked to obesity and metabolic disease</Text>
                <Text style={styles.ingExplanation}>
                  Highly processed sweetener associated with increased risk of type 2 diabetes, fatty liver disease, and cardiovascular issues.
                </Text>
                <View style={styles.citationBtn}>
                  <ExternalLink size={12} color="#118AB2" />
                  <Text style={styles.citationBtnText}>View Sources (3)</Text>
                </View>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerMock}>
                <Info size={14} color="#FFA500" />
                <Text style={styles.disclaimerText}>For entertainment purposes only. Not medical advice.</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 5: LIFESTYLE ───
// Screenshot: History screen with scans
// Caption: "Track Everything You Eat"
function Slide5() {
  const scans = [
    { name: "Organic Granola Bar", score: 82, color: "#06D6A0", grade: "B Grade", time: "Today", count: 8 },
    { name: "Coca-Cola Classic", score: 18, color: "#E63946", grade: "Health Hazard", time: "Today", count: 12 },
    { name: "Greek Yogurt", score: 91, color: "#118AB2", grade: "A Grade", time: "Yesterday", count: 6 },
    { name: "Doritos Nacho Cheese", score: 28, color: "#E63946", grade: "Health Hazard", time: "Yesterday", count: 15 },
    { name: "Kind Protein Bar", score: 65, color: "#FCBF49", grade: "Premium Slop", time: "Mar 5", count: 10 },
  ];

  return (
    <PreviewFrame caption="Track Everything You Scan" subcaption="Build a history of smarter choices">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#FFFFFF" }]}>
          {/* History header */}
          <View style={styles.historyHeader}>
            <View style={styles.histSearchBar}>
              <Search size={16} color="#999" />
              <Text style={styles.histSearchText}>Search products...</Text>
            </View>
            <View style={styles.histFilterRow}>
              <View style={styles.histFilterBtn}>
                <SlidersHorizontal size={14} color="#1A1A1A" />
                <Text style={styles.histFilterText}>Filters</Text>
              </View>
              <View style={styles.histFilterBtn}>
                <ArrowUpDown size={14} color="#1A1A1A" />
                <Text style={styles.histFilterText}>Newest</Text>
              </View>
            </View>
            <Text style={styles.histCount}>{scans.length} scans</Text>
          </View>

          {/* Scan list */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.histList}>
              {scans.map((scan, i) => (
                <View key={i} style={[styles.histCard, { borderLeftColor: scan.color }]}>
                  <View style={styles.histThumb}>
                    <Package size={20} color="#CCC" />
                  </View>
                  <View style={styles.histCardContent}>
                    <Text style={styles.histProductName} numberOfLines={1}>{scan.name}</Text>
                    <View style={styles.histMeta}>
                      <Clock size={11} color="#999" />
                      <Text style={styles.histTime}>{scan.time}</Text>
                    </View>
                    <Text style={styles.histIngCount}>{scan.count} ingredients</Text>
                  </View>
                  <View style={styles.histScoreArea}>
                    <View style={[styles.histScoreBadge, { backgroundColor: scan.color }]}>
                      <Text style={styles.histScoreText}>{scan.score}</Text>
                    </View>
                    <Text style={[styles.histGrade, { color: scan.color }]}>{scan.grade}</Text>
                    <ChevronRight size={14} color="#CCC" />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 6: TRUST ───
// Screenshot: Privacy & trust signals
// Caption: "Your Privacy Comes First"
function Slide6() {
  const trustPoints = [
    { icon: <Lock size={22} color="#118AB2" />, title: "100% On-Device", desc: "Photos never leave your phone" },
    { icon: <BookOpen size={22} color="#06D6A0" />, title: "Real Citations", desc: "FDA, NIH, WHO & PubMed sources" },
    { icon: <Eye size={22} color="#9B59B6" />, title: "Full Transparency", desc: "See why each score was given" },
    { icon: <Users size={22} color="#F77F00" />, title: "No Account Needed", desc: "Download and start scanning" },
  ];

  return (
    <PreviewFrame caption="Your Privacy Comes First" subcaption="No data leaves your device. Ever.">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#F0FDF4" }]}>
          <View style={styles.trustLayout}>
            <View style={styles.trustShieldWrap}>
              <Shield size={48} color="#06D6A0" />
            </View>

            {trustPoints.map((tp, i) => (
              <View key={i} style={styles.trustRowMock}>
                <View style={styles.trustIconBox}>{tp.icon}</View>
                <View style={styles.trustTextBox}>
                  <Text style={styles.trustTitleMock}>{tp.title}</Text>
                  <Text style={styles.trustDescMock}>{tp.desc}</Text>
                </View>
                <Check size={18} color="#06D6A0" />
              </View>
            ))}

            <View style={styles.trustRatingRow}>
              {[1, 2, 3, 4].map(i => (
                <Star key={i} size={20} color="#FFD700" fill="#FFD700" />
              ))}
              <Star size={20} color="#FFD700" />
              <Text style={styles.trustRatingText}>4.0 on App Store</Text>
            </View>

            <View style={styles.trustQuote}>
              <Text style={styles.trustQuoteText}>
                "Finally an app that tells me what's actually in my food without selling my data."
              </Text>
            </View>
          </View>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Slide 7: BRAND STORY ───
// Screenshot: Brand / download CTA
// Caption: "Know What You're Eating"
function Slide7() {
  return (
    <PreviewFrame caption="Know What You're Eating" subcaption="Join thousands making healthier choices">
      <View style={styles.phoneScreen}>
        <View style={[styles.mockScreen, { backgroundColor: "#0D3B66" }]}>
          <LinearGradient
            colors={["#0D3B66", "#118AB2", "#06D6A0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            <View style={styles.brandLayout}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.brandLogoMock}
                resizeMode="contain"
              />
              <Text style={styles.brandNameMock}>Kiwi</Text>
              <Text style={styles.brandTaglineMock}>Better Health Scanner</Text>

              <View style={styles.brandMissionBox}>
                <Leaf size={16} color="#06D6A0" />
                <Text style={styles.brandMissionMock}>
                  Everyone deserves to know what's in their food. Scan, learn, and choose better.
                </Text>
              </View>

              <View style={styles.brandValuesList}>
                {[
                  { dot: "#06D6A0", text: "Transparency First" },
                  { dot: "#FFFFFF", text: "Privacy by Design" },
                  { dot: "#FFD700", text: "Science-Backed Ratings" },
                  { dot: "#9B59B6", text: "Accessible to Everyone" },
                ].map((v, i) => (
                  <View key={i} style={styles.brandValueRow}>
                    <View style={[styles.brandDot, { backgroundColor: v.dot }]} />
                    <Text style={styles.brandValueText}>{v.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.brandCtaMock}>
                <Text style={styles.brandCtaText}>Download Free</Text>
              </View>
              <Text style={styles.brandPriceLine}>Free  •  Premium $4.99 one-time</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </PreviewFrame>
  );
}

// ─── Frame wrapper with caption ───
function PreviewFrame({ caption, subcaption, children }: { caption: string; subcaption: string; children: React.ReactNode }) {
  return (
    <View style={styles.frameContainer}>
      <LinearGradient
        colors={["#0D3B66", "#118AB2"]}
        style={styles.frameGradient}
      >
        <View style={styles.captionArea}>
          <Text style={styles.captionText}>{caption}</Text>
          <Text style={styles.subcaptionText}>{subcaption}</Text>
        </View>
        {children}
      </LinearGradient>
    </View>
  );
}

// ─── Slides config ───
const slides = [
  { key: "1", label: "1 · Click Image", component: Slide1 },
  { key: "2", label: "2 · Ingredients", component: Slide2 },
  { key: "3", label: "3 · Benefits", component: Slide3 },
  { key: "4", label: "4 · Product Details", component: Slide4 },
  { key: "5", label: "5 · Lifestyle", component: Slide5 },
  { key: "6", label: "6 · Trust", component: Slide6 },
  { key: "7", label: "7 · Brand Story", component: Slide7 },
];

export default function PreviewPhotosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Preview Photos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slideWrapper, { width: SCREEN_WIDTH }]}>
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
    backgroundColor: "#F2F2F7",
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  scrollContent: {},
  slideWrapper: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  slideLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ─── Frame ───
  frameContainer: {
    width: PHONE_WIDTH + 32,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  frameGradient: {
    paddingTop: 32,
    paddingBottom: 20,
    alignItems: "center",
  },
  captionArea: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  captionText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
  },
  subcaptionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 6,
  },

  // ─── Phone ───
  phoneScreen: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mockScreen: {
    flex: 1,
  },

  // ─── Slide 1: Camera ───
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
  },
  camHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  camHeaderLeft: { width: 32 },
  camHeaderCenter: { flex: 1, alignItems: "center" },
  camHeaderRight: { width: 32, alignItems: "flex-end" },
  camTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  camSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 2,
  },
  camScanFrame: {
    marginHorizontal: 24,
    flex: 1,
    marginVertical: 50,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 16,
    borderStyle: "dashed",
  },
  camControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  camSideBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  camCaptureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  camCaptureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── Slide 2: Ingredients ───
  resultCardMock: {
    padding: 16,
    alignItems: "center",
  },
  scoreCircleMock: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  scoreNumMock: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  scoreOfMock: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginTop: -3,
  },
  gradeLabelMock: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  productNameMock: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  sectionHeaderMock: {
    width: "100%",
    marginBottom: 8,
  },
  sectionTitleMock: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  ingredientCardMock: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  ingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  ingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ingName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  ingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ingScore: {
    fontSize: 12,
    fontWeight: "700",
  },
  ingImpact: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  // ─── Slide 3: Benefits ───
  benefitsLayout: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  benefitsHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  benefitRowMock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  benefitIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  benefitTextBox: {
    flex: 1,
    gap: 2,
  },
  benefitTitleMock: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  benefitDescMock: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  benefitsBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
  },
  benefitsBadgeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },

  // ─── Slide 4: Product Details ───
  productImageArea: {
    height: 140,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  productImagePlaceholder: {
    alignItems: "center",
    gap: 4,
  },
  productImageText: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  floatingBack: {
    position: "absolute",
    top: 40,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingShare: {
    position: "absolute",
    top: 40,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailResultCard: {
    marginTop: -20,
    marginHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailIngredient: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 4,
  },
  ingImpactBold: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 4,
  },
  ingExplanation: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },
  citationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "rgba(17,138,178,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  citationBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#118AB2",
  },
  disclaimerMock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "rgba(255,165,0,0.08)",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#888",
    flex: 1,
  },

  // ─── Slide 5: History ───
  historyHeader: {
    paddingTop: 40,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  histSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  histSearchText: {
    fontSize: 13,
    color: "#999",
  },
  histFilterRow: {
    flexDirection: "row",
    gap: 8,
  },
  histFilterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 8,
  },
  histFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  histCount: {
    fontSize: 11,
    color: "#999",
  },
  histList: {
    paddingHorizontal: 12,
    paddingTop: 4,
    gap: 8,
    paddingBottom: 20,
  },
  histCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  histThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  histCardContent: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  histProductName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  histMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  histTime: {
    fontSize: 10,
    color: "#999",
  },
  histIngCount: {
    fontSize: 10,
    color: "#999",
  },
  histScoreArea: {
    alignItems: "center",
    gap: 2,
  },
  histScoreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  histScoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  histGrade: {
    fontSize: 9,
    fontWeight: "600",
  },

  // ─── Slide 6: Trust ───
  trustLayout: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 14,
  },
  trustShieldWrap: {
    alignItems: "center",
    marginBottom: 4,
  },
  trustRowMock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  trustIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  trustTextBox: {
    flex: 1,
    gap: 1,
  },
  trustTitleMock: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  trustDescMock: {
    fontSize: 11,
    color: "#666",
  },
  trustRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 4,
  },
  trustRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 6,
  },
  trustQuote: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#06D6A0",
  },
  trustQuoteText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#444",
    lineHeight: 18,
  },

  // ─── Slide 7: Brand ───
  brandLayout: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  brandLogoMock: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  brandNameMock: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  brandTaglineMock: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: -8,
  },
  brandMissionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  brandMissionMock: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  brandValuesList: {
    gap: 10,
    width: "100%",
  },
  brandValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  brandCtaMock: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  brandCtaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#118AB2",
  },
  brandPriceLine: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
});
