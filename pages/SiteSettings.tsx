import React, { useState, useEffect } from 'react';
import { useData } from '../store/DataContext';
import { IOSNavBar, IOSSectionHeader, IOSCardGroup, IOSInput, IOSTextArea, IOSListRow, IOSButton, IOSSheet, IOSAlert } from '../components/IOSComponents';
import { Globe, Phone, Info, Share2, Settings } from 'lucide-react';

const SiteSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    siteSettings, contactSettings, aboutSettings, socialSettings, configSettings,
    updateSiteSettings, updateContactSettings, updateAboutSettings,
    updateSocialSettings, updateConfigSettings
  } = useData();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // General Info
  const [siteName, setSiteName] = useState(siteSettings.name);
  const [siteTagline, setSiteTagline] = useState(siteSettings.tagline);
  const [foundedYear, setFoundedYear] = useState(String(siteSettings.foundedYear));

  // Contact
  const [email, setEmail] = useState(contactSettings.email);
  const [phone, setPhone] = useState(contactSettings.phone);
  const [address, setAddress] = useState(contactSettings.address);
  const [monFri, setMonFri] = useState(contactSettings.businessHours?.mondayFriday || '');
  const [sat, setSat] = useState(contactSettings.businessHours?.saturday || '');
  const [sun, setSun] = useState(contactSettings.businessHours?.sunday || '');

  // About
  const [authorName, setAuthorName] = useState(aboutSettings.author?.name || '');
  const [authorTagline, setAuthorTagline] = useState(aboutSettings.author?.tagline || '');
  const [authorDesc, setAuthorDesc] = useState(aboutSettings.author?.description || '');
  const [authorImage, setAuthorImage] = useState(aboutSettings.author?.profileImage || '');
  const [offerings, setOfferings] = useState(aboutSettings.offerings || []);
  const [team, setTeam] = useState(aboutSettings.team || []);

  // Config
  const [freeDelMin, setFreeDelMin] = useState(String(configSettings.freeDeliveryMin || 0));
  const [delCharge, setDelCharge] = useState(String(configSettings.deliveryCharge || 0));
  const [upiId, setUpiId] = useState(configSettings.upiId || '');

  // Social
  const [social, setSocial] = useState(socialSettings);

  // Offering edit
  const [editOfferingIdx, setEditOfferingIdx] = useState<number | null>(null);
  const [offeringTitle, setOfferingTitle] = useState('');
  const [offeringDesc, setOfferingDesc] = useState('');

  // Team edit
  const [editTeamIdx, setEditTeamIdx] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamInitials, setTeamInitials] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{ type: string; idx: number } | null>(null);

  // Update local state when context changes
  useEffect(() => {
    setSiteName(siteSettings.name);
    setSiteTagline(siteSettings.tagline);
    setFoundedYear(String(siteSettings.foundedYear));
  }, [siteSettings]);

  useEffect(() => {
    setEmail(contactSettings.email);
    setPhone(contactSettings.phone);
    setAddress(contactSettings.address);
    setMonFri(contactSettings.businessHours?.mondayFriday || '');
    setSat(contactSettings.businessHours?.saturday || '');
    setSun(contactSettings.businessHours?.sunday || '');
  }, [contactSettings]);

  useEffect(() => {
    setAuthorName(aboutSettings.author?.name || '');
    setAuthorTagline(aboutSettings.author?.tagline || '');
    setAuthorDesc(aboutSettings.author?.description || '');
    setAuthorImage(aboutSettings.author?.profileImage || '');
    setOfferings(aboutSettings.offerings || []);
    setTeam(aboutSettings.team || []);
  }, [aboutSettings]);

  useEffect(() => {
    setFreeDelMin(String(configSettings.freeDeliveryMin || 0));
    setDelCharge(String(configSettings.deliveryCharge || 0));
    setUpiId(configSettings.upiId || '');
  }, [configSettings]);

  useEffect(() => {
    setSocial(socialSettings);
  }, [socialSettings]);

  const saveGeneral = async () => {
    setSaving(true);
    await updateSiteSettings({ name: siteName, tagline: siteTagline, foundedYear: Number(foundedYear) });
    setSaving(false);
    setActiveSection(null);
  };

  const saveContact = async () => {
    setSaving(true);
    await updateContactSettings({ email, phone, address, businessHours: { mondayFriday: monFri, saturday: sat, sunday: sun } });
    setSaving(false);
    setActiveSection(null);
  };

  const saveAbout = async () => {
    setSaving(true);
    await updateAboutSettings({ author: { name: authorName, tagline: authorTagline, description: authorDesc, profileImage: authorImage }, offerings, team });
    setSaving(false);
    setActiveSection(null);
  };

  const saveSocial = async () => {
    setSaving(true);
    await updateSocialSettings(social);
    setSaving(false);
    setActiveSection(null);
  };

  const saveConfig = async () => {
    setSaving(true);
    await updateConfigSettings({ freeDeliveryMin: Number(freeDelMin), deliveryCharge: Number(delCharge), upiId });
    setSaving(false);
    setActiveSection(null);
  };

  const platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'telegram', 'whatsapp', 'linkedin', 'github'] as const;

  return (
    <div className="h-full bg-ios-bg overflow-y-auto ios-bounce">
      <IOSNavBar title="Site Settings" leftAction={{ label: 'Back', onClick: onBack }} />
      <div className="pb-[90px]">

        <IOSSectionHeader title="Configuration" />
        <IOSCardGroup>
          <IOSListRow
            label="General Info"
            icon={<Globe size={16} className="text-white" />}
            iconBg="bg-ios-blue"
            chevron
            onClick={() => setActiveSection('general')}
            subtitle="Site name, tagline, founded year"
          />
          <IOSListRow
            label="Contact Info"
            icon={<Phone size={16} className="text-white" />}
            iconBg="bg-ios-green"
            chevron
            onClick={() => setActiveSection('contact')}
            subtitle="Email, phone, address, hours"
          />
          <IOSListRow
            label="About Page"
            icon={<Info size={16} className="text-white" />}
            iconBg="bg-ios-purple"
            chevron
            onClick={() => setActiveSection('about')}
            subtitle="Author, offerings, team"
          />
          <IOSListRow
            label="Social Links"
            icon={<Share2 size={16} className="text-white" />}
            iconBg="bg-ios-pink"
            chevron
            onClick={() => setActiveSection('social')}
            subtitle="Facebook, Instagram, Twitter..."
          />
          <IOSListRow
            label="Delivery & Payment"
            icon={<Settings size={16} className="text-white" />}
            iconBg="bg-ios-orange"
            chevron
            onClick={() => setActiveSection('config')}
            subtitle="Delivery charges, UPI"
            isLast
          />
        </IOSCardGroup>

        {/* Current Values Preview */}
        <IOSSectionHeader title="Current Values" />
        <IOSCardGroup>
          <IOSListRow label="Site Name" value={siteSettings.name || '—'} />
          <IOSListRow label="Email" value={contactSettings.email || '—'} />
          <IOSListRow label="Free Delivery" value={`₹${configSettings.freeDeliveryMin || 0}`} />
          <IOSListRow label="Delivery Fee" value={`₹${configSettings.deliveryCharge || 0}`} />
          <IOSListRow label="UPI ID" value={configSettings.upiId || '—'} isLast />
        </IOSCardGroup>

        {/* Sync Status */}
        <IOSSectionHeader title="Sync Status" />
        <IOSCardGroup>
          <div className="flex items-center gap-[10px] px-4 min-h-[44px] py-[10px]">
            <div className="w-[29px] h-[29px] rounded-[7px] bg-ios-green flex items-center justify-center flex-shrink-0">
              <span className="relative flex h-[9px] w-[9px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                <span className="relative inline-flex rounded-full h-[9px] w-[9px] bg-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[17px] leading-[22px] text-ios-label">Live</span>
              <p className="text-[13px] text-ios-gray leading-[18px] mt-[1px]">All changes sync in real-time with your store</p>
            </div>
          </div>
        </IOSCardGroup>

        <p className="text-[12px] text-ios-gray text-center mt-[20px] mb-[8px] px-5 leading-[16px]">
          Connected to Firebase · ecom-6586a
        </p>
      </div>

      {/* General Info Sheet */}
      <IOSSheet open={activeSection === 'general'} onClose={() => setActiveSection(null)} title="General Info">
        <div className="pt-4">
          <IOSSectionHeader title="Site Information" />
          <IOSCardGroup>
            <IOSInput label="Site Name" value={siteName} onChange={setSiteName} />
            <IOSInput label="Tagline" value={siteTagline} onChange={setSiteTagline} />
            <IOSInput label="Founded" value={foundedYear} onChange={setFoundedYear} type="number" isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveGeneral}>{saving ? 'Saving...' : 'Save Changes'}</IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* Contact Sheet */}
      <IOSSheet open={activeSection === 'contact'} onClose={() => setActiveSection(null)} title="Contact Info">
        <div className="pt-4">
          <IOSSectionHeader title="Contact Details" />
          <IOSCardGroup>
            <IOSInput label="Email" value={email} onChange={setEmail} type="email" />
            <IOSInput label="Phone" value={phone} onChange={setPhone} />
            <IOSInput label="Address" value={address} onChange={setAddress} isLast />
          </IOSCardGroup>
          <IOSSectionHeader title="Business Hours" />
          <IOSCardGroup>
            <IOSInput label="Mon - Fri" value={monFri} onChange={setMonFri} />
            <IOSInput label="Saturday" value={sat} onChange={setSat} />
            <IOSInput label="Sunday" value={sun} onChange={setSun} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveContact}>{saving ? 'Saving...' : 'Save Changes'}</IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* About Sheet */}
      <IOSSheet open={activeSection === 'about'} onClose={() => setActiveSection(null)} title="About Page">
        <div className="pt-4">
          <IOSSectionHeader title="Author" />
          <IOSCardGroup>
            <IOSInput label="Name" value={authorName} onChange={setAuthorName} />
            <IOSInput label="Tagline" value={authorTagline} onChange={setAuthorTagline} />
            <IOSInput label="Image URL" value={authorImage} onChange={setAuthorImage} />
            <IOSTextArea label="Description" value={authorDesc} onChange={setAuthorDesc} isLast />
          </IOSCardGroup>

          <IOSSectionHeader title="Offerings" action={{ label: 'Add', onClick: () => { setEditOfferingIdx(-1); setOfferingTitle(''); setOfferingDesc(''); } }} />
          <IOSCardGroup>
            {offerings.length === 0 && <div className="px-4 py-6 text-center text-ios-gray text-[15px]">No offerings yet</div>}
            {offerings.map((o, i) => (
              <IOSListRow
                key={i}
                label={o.title}
                subtitle={o.description}
                chevron
                onClick={() => { setEditOfferingIdx(i); setOfferingTitle(o.title); setOfferingDesc(o.description); }}
                isLast={i === offerings.length - 1}
              />
            ))}
          </IOSCardGroup>

          <IOSSectionHeader title="Team" action={{ label: 'Add', onClick: () => { setEditTeamIdx(-1); setTeamName(''); setTeamRole(''); setTeamInitials(''); } }} />
          <IOSCardGroup>
            {team.length === 0 && <div className="px-4 py-6 text-center text-ios-gray text-[15px]">No team members</div>}
            {team.map((t, i) => (
              <IOSListRow
                key={i}
                label={t.name}
                subtitle={t.role}
                value={t.initials}
                chevron
                onClick={() => { setEditTeamIdx(i); setTeamName(t.name); setTeamRole(t.role); setTeamInitials(t.initials); }}
                isLast={i === team.length - 1}
              />
            ))}
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveAbout}>{saving ? 'Saving...' : 'Save All About Settings'}</IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* Social Sheet */}
      <IOSSheet open={activeSection === 'social'} onClose={() => setActiveSection(null)} title="Social Links">
        <div className="pt-4">
          <IOSSectionHeader title="Platforms" />
          <IOSCardGroup>
            {platforms.map((p, i) => (
              <div key={p} className={`${i < platforms.length - 1 ? 'border-b border-ios-separator/30' : ''}`}>
                <div className="flex items-center px-4 py-3">
                  <span className="text-[17px] capitalize flex-1">{p}</span>
                  <input
                    type="checkbox"
                    className="ios-switch"
                    checked={social[p]?.show || false}
                    onChange={(e) => setSocial({ ...social, [p]: { ...social[p], url: social[p]?.url || '', show: e.target.checked } })}
                  />
                </div>
                <div className="px-4 pb-3">
                  <input
                    type="url"
                    value={social[p]?.url || ''}
                    onChange={(e) => setSocial({ ...social, [p]: { ...social[p], show: social[p]?.show || false, url: e.target.value } })}
                    placeholder={`${p} URL`}
                    className="w-full bg-ios-gray6 rounded-lg px-3 py-2 text-[15px] outline-none"
                  />
                </div>
              </div>
            ))}
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveSocial}>{saving ? 'Saving...' : 'Save Social Links'}</IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* Config Sheet */}
      <IOSSheet open={activeSection === 'config'} onClose={() => setActiveSection(null)} title="Delivery & Payment">
        <div className="pt-4">
          <IOSSectionHeader title="Delivery Settings" />
          <IOSCardGroup>
            <IOSInput label="Free Min ₹" value={freeDelMin} onChange={setFreeDelMin} type="number" />
            <IOSInput label="Charge ₹" value={delCharge} onChange={setDelCharge} type="number" isLast />
          </IOSCardGroup>
          <IOSSectionHeader title="Payment" />
          <IOSCardGroup>
            <IOSInput label="UPI ID" value={upiId} onChange={setUpiId} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6">
            <IOSButton onClick={saveConfig}>{saving ? 'Saving...' : 'Save Config'}</IOSButton>
          </div>
        </div>
      </IOSSheet>

      {/* Offering Edit Sheet */}
      <IOSSheet open={editOfferingIdx !== null} onClose={() => setEditOfferingIdx(null)} title={editOfferingIdx === -1 ? 'Add Offering' : 'Edit Offering'}>
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="Title" value={offeringTitle} onChange={setOfferingTitle} />
            <IOSTextArea label="Description" value={offeringDesc} onChange={setOfferingDesc} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6 flex flex-col gap-3">
            <IOSButton onClick={() => {
              if (editOfferingIdx === -1) {
                setOfferings([...offerings, { title: offeringTitle, description: offeringDesc }]);
              } else if (editOfferingIdx !== null) {
                const updated = [...offerings];
                updated[editOfferingIdx] = { title: offeringTitle, description: offeringDesc };
                setOfferings(updated);
              }
              setEditOfferingIdx(null);
            }}>Save</IOSButton>
            {editOfferingIdx !== null && editOfferingIdx >= 0 && (
              <IOSButton variant="destructive" onClick={() => { setDeleteTarget({ type: 'offering', idx: editOfferingIdx }); }}>Delete Offering</IOSButton>
            )}
          </div>
        </div>
      </IOSSheet>

      {/* Team Edit Sheet */}
      <IOSSheet open={editTeamIdx !== null} onClose={() => setEditTeamIdx(null)} title={editTeamIdx === -1 ? 'Add Member' : 'Edit Member'}>
        <div className="pt-4">
          <IOSCardGroup>
            <IOSInput label="Name" value={teamName} onChange={setTeamName} />
            <IOSInput label="Role" value={teamRole} onChange={setTeamRole} />
            <IOSInput label="Initials" value={teamInitials} onChange={setTeamInitials} isLast />
          </IOSCardGroup>
          <div className="px-4 mt-6 flex flex-col gap-3">
            <IOSButton onClick={() => {
              if (editTeamIdx === -1) {
                setTeam([...team, { name: teamName, role: teamRole, initials: teamInitials, order: team.length + 1 }]);
              } else if (editTeamIdx !== null) {
                const updated = [...team];
                updated[editTeamIdx] = { ...updated[editTeamIdx], name: teamName, role: teamRole, initials: teamInitials };
                setTeam(updated);
              }
              setEditTeamIdx(null);
            }}>Save</IOSButton>
            {editTeamIdx !== null && editTeamIdx >= 0 && (
              <IOSButton variant="destructive" onClick={() => { setDeleteTarget({ type: 'team', idx: editTeamIdx }); }}>Delete Member</IOSButton>
            )}
          </div>
        </div>
      </IOSSheet>

      <IOSAlert
        open={deleteTarget !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'offering') {
              setOfferings(offerings.filter((_, i) => i !== deleteTarget.idx));
            } else if (deleteTarget.type === 'team') {
              setTeam(team.filter((_, i) => i !== deleteTarget.idx));
            }
            setDeleteTarget(null);
            setEditOfferingIdx(null);
            setEditTeamIdx(null);
          }
        }}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};

export default SiteSettings;
