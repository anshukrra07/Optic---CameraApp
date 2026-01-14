import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isVerySmallScreen = height < 600;

// Calculate responsive positions
const getBottomSafeArea = () => {
  if (isVerySmallScreen) return 80;
  if (isSmallScreen) return 100;
  return 120;
};

const BOTTOM_SAFE_AREA = getBottomSafeArea();
const SHUTTER_HEIGHT = 80;
const CONTROLS_HEIGHT = 60;
const MODES_HEIGHT = 50;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'box-none', // Allow touches to pass through to camera
  },
  
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: BOTTOM_SAFE_AREA,
    pointerEvents: 'box-none',
  },

  topBar: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIndicator: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  topIndicatorText: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: '600',
  },

  modeStrip: { position: 'relative', marginBottom: 20, zIndex: 10 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  modeActive: { backgroundColor: '#fff', borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  modeTxt: { color: '#fff', fontSize: 14, fontWeight: '500' },
  modeTxtActive: { color: '#000', fontWeight: '700' },

  controls: { position: 'relative', marginBottom: 15, paddingHorizontal: 20, zIndex: 10 },
  
  // iPhone-style Quick Controls
  quickControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    minHeight: 55,
  },
  quickControl: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 65,
    backgroundColor: 'transparent',
    flex: 1,
    marginHorizontal: 2,
  },
  quickControlActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 193, 7, 0.7)',
    borderRadius: 15,
  },
  quickControlIcon: {
    fontSize: 18,
    marginBottom: 2,
    color: '#fff',
  },
  quickControlIconActive: {
    color: '#FFC107',
  },
  quickControlLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  quickControlLabelActive: {
    color: '#FFC107',
    fontWeight: '600',
  },
  
  // iPhone-style Sliding Panel
  panelOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '60%',
    minHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  panelClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  panelContent: {
    flex: 1,
  },
  panelContentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  panelSection: {
    marginBottom: 20,
  },
  panelSectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  panelOption: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  panelOptionActive: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  panelOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#fff',
  },
  panelOptionIconActive: {
    color: '#000',
  },
  panelOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  panelOptionTextActive: {
    color: '#000',
  },

  bottomBar: { position: 'relative', width: '100%', alignItems: 'center', paddingHorizontal: 20, zIndex: 10, marginBottom: 10 },
  shutterContainer: { alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  rec: { borderColor: '#FF4444' },
  recInner: { backgroundColor: '#FF4444' },
  stop: { borderColor: '#FF4444' },
  stopInner: { backgroundColor: '#FF4444', borderRadius: 8, width: 40, height: 40 },
  shutterTxt: { fontSize: 28, color: '#000' },
  shutterTxtRec: { color: '#fff' },
  
  // Zoom indicator
  zoomIndicator: {
    position: 'absolute',
    top: '45%',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },

  // Control Container Styles
  controlContainer: {
    marginVertical: 4,
    minWidth: 140,
    maxWidth: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  controlContainerCompact: {
    marginVertical: 2,
  },
  controlHeader: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlHeaderExpanded: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  controlHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  controlTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  expandIcon: {
    color: '#fff',
    fontSize: 12,
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  controlContent: {
    padding: 12,
  },
  controlSubTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});


