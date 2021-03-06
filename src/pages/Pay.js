import React, { useState } from 'react';
import { Steps, Row, Col, Input, Radio, Select, Button, message as messageAntd } from 'antd';
import { ShoppingCartOutlined, IdcardOutlined, PercentageOutlined, CreditCardOutlined, LeftOutlined } from '@ant-design/icons';
import { SiHomeassistantcommunitystore } from 'react-icons/si';
import { FiPackage } from 'react-icons/fi';
import { MdPayment } from 'react-icons/md';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { BsFillCartPlusFill } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Client } from 'components/layouts';
import { packageActions, cartActions } from 'actions';
import { selectAuth, selectCart, selectPackage } from 'selectors';
import { sumMoney, moneyMask, sumMoneyNumber } from 'utils/number';
import validator from 'validator';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const color_disable = '#0e2431';

function Pay(props) {
  const navigate = useNavigate();
  const {
    actions: { createPackage, clearCart },
    selectAuthStatus: { user },
    selectCartInformation: { products },
    selectListPackage: { packageNew },
  } = props;
  const [stateStep, setStateStep] = useState(1);
  const [stateRadio, setStateRadio] = useState(1);
  const [stateStore, setStateStore] = useState('');
  const [stateInfor, setStateInfor] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    full_address: '',
    provice: '',
    district: '',
    address: '',
    note: '',
    voucher: '',
    is_pay: undefined,
  });

  const { full_name, phone_number, email, full_address, provice, district, address, note, voucher, is_pay } = stateInfor;

  const sumPay = sumMoney(products?.map(item => item.quantity * item.value_option));

  const sumPayNumber = sumMoneyNumber(products?.map(item => item.quantity * item.value_option));

  const onChangeInput = e => setStateInfor({ ...stateInfor, [e.target.name]: e.target.value });

  const styleIconStep = { width: 36, height: 36, borderRadius: 18, border: '1px solid #000' };

  const handleGoBack = () => {
    if (stateStep === 0) navigate('/cart');
    else setStateStep(stateStep - 1);
  };

  const handleNext = () => {
    if (!full_name || !phone_number || !email) {
      return messageAntd.error('B???n ch??a nh???p ????? tr?????ng th??ng tin c?? nh??n');
    }
    if (!validator.isMobilePhone(String(phone_number), 'vi-VN')) {
      return messageAntd.error('B???n ch??a nh???p ????ng s??? ??i???n tho???i');
    }
    if (!validator.isEmail(String(email))) {
      return messageAntd.error('B???n ch??a nh???p ????ng t??i kho???n email');
    }
    if ((stateRadio === 1 && !stateStore) || (stateRadio === 2 && !provice && !district && !address)) {
      return messageAntd.error('B???n ch??a nh???p ?????y ?????/l???a ch???n ?????a ch??? nh???n h??ng');
    }

    setStateInfor({ ...stateInfor, full_address: stateRadio === 1 ? stateStore : `${address}-${district}-${provice}` });
    if (stateStep === 3) {
      if (!is_pay) {
        return messageAntd.error('Vui l??ng ch???n ph????ng th???c thanh to??n');
      }
      createPackage({
        user_id: user._id,
        products,
        full_name,
        phone_number,
        email,
        voucher,
        value: sumPayNumber,
        address: full_address,
        is_access: false,
        note,
        is_pay,
      });
      clearCart({ user_id: user._id });
    }

    return setStateStep(stateStep + 1);
  };

  const renderItemPay = (text, icon) => {
    return (
      <div
        className="box-shadow d-flex flex-column align-items-center justify-content-center p-8 border-radius-16 cursor-pointer"
        style={(is_pay && is_pay === text && { border: '1px solid #f5222d', color: '#f5222d' }) || {}}
        onClick={() => setStateInfor({ ...stateInfor, is_pay: text })}>
        <div>{text}</div>
        <div>{icon}</div>
      </div>
    );
  };

  const renderItemProduct = item => {
    return (
      <div className="box-shadow p-16 mt-16 cart-detail" style={{ borderRadius: 16 }}>
        <div className="d-flex">
          <div>
            <img src={item.image_link} alt={item.name} width={160} height={160} />
          </div>
          <div className="ml-8 w-100">
            <div className="d-flex justify-content-between w-100 fw-700 fz-16">{/* {item.name} ({item.name_option}) */}</div>
            <div className="text-red fw-700 fz-16">{moneyMask(item.value_option)}</div>
            <div className="d-flex align-items-center">
              <div className="fw-500">S??? l?????ng: {item.quantity}</div>
            </div>
            <div className="d-flex align-items-center">
              <div className="fw-500">T???ng ti???n: {moneyMask(item.quantity * item.value_option)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Client footer={false}>
      <div className="d-flex justify-content-center">
        <div style={{ padding: '16px', minWidth: 800 }}>
          <div>
            <div className="d-flex text-red fz-18 fw-700 align-items-center justify-content-center mb-16" style={{ position: 'relative' }}>
              <div
                className="d-flex align-items-center justify-content-center cursor-pointer"
                onClick={() => handleGoBack()}
                style={{ position: 'absolute', left: 0 }}>
                <LeftOutlined style={{ fontSize: 14 }} />
                Tr??? v???
              </div>
              <div>
                {stateStep === 1
                  ? 'Th??ng tin ?????t h??ng'
                  : stateStep === 2
                  ? 'Phi???u gi???m gi??'
                  : stateStep === 3
                  ? 'Ch???n ph????ng th???c thanh to??n'
                  : 'Ho??n t???t'}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fef2f260', borderRadius: 16 }}>
            <Row>
              <Col span={8}>
                <Steps
                  current={stateStep}
                  className="step-custom p-16"
                  direction="vertical"
                  labelPlacement="vertical"
                  onChange={e => setStateStep(e)}>
                  <Step
                    disabled
                    title="Ch???n s??ch"
                    icon={
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ ...styleIconStep, borderColor: (stateStep >= 0 && '#f8bc5a') || color_disable }}>
                        <ShoppingCartOutlined style={{ color: (stateStep >= 0 && '#f8bc5a') || color_disable, fontSize: 16 }} />
                      </div>
                    }
                  />
                  <Step
                    disabled
                    title="Th??ng tin"
                    icon={
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ ...styleIconStep, borderColor: (stateStep >= 1 && '#f8bc5a') || color_disable }}>
                        <IdcardOutlined style={{ color: (stateStep >= 1 && '#f8bc5a') || color_disable, fontSize: 16 }} />
                      </div>
                    }
                  />
                  <Step
                    disabled
                    title="Voucher"
                    icon={
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ ...styleIconStep, borderColor: (stateStep >= 2 && '#f8bc5a') || color_disable }}>
                        <PercentageOutlined style={{ color: (stateStep >= 2 && '#f8bc5a') || color_disable, fontSize: 16 }} />
                      </div>
                    }
                  />
                  <Step
                    disabled
                    title="Thanh to??n"
                    icon={
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ ...styleIconStep, borderColor: (stateStep >= 3 && '#f8bc5a') || color_disable }}>
                        <CreditCardOutlined style={{ color: (stateStep >= 3 && '#f8bc5a') || color_disable, fontSize: 16 }} />
                      </div>
                    }
                  />
                  <Step
                    disabled
                    title="Ho??n t???t"
                    icon={
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ ...styleIconStep, borderColor: (stateStep >= 4 && '#f8bc5a') || color_disable }}>
                        <FiPackage style={{ color: (stateStep >= 4 && '#f8bc5a') || color_disable, fontSize: 16 }} />
                      </div>
                    }
                  />
                </Steps>
              </Col>
              <Col span={16}>
                {stateStep === 2 && (
                  <div className="p-16">
                    <div className="box-shadow p-16 border-radius-16 d-flex" style={{ background: 'white' }}>
                      <Input name="voucher" value={voucher} onChange={onChangeInput} placeholder="Nh???p phi???u gi???m gi??" />
                      <Button className="btn-buy ml-8" style={{ height: 36 }}>
                        ??p d???ng
                      </Button>
                    </div>
                  </div>
                )}

                <div className="box-shadow border-radius-16 p-16" style={{ backgroundColor: 'white' }}>
                  {stateStep === 1 && (
                    <>
                      <div className="fz-16 fw-700">Th??ng tin kh??ch h??ng</div>
                      <div className="mt-8">
                        <Input name="full_name" value={full_name} onChange={onChangeInput} placeholder="H??? v?? t??n (b???t bu???c)" />
                      </div>
                      <div className="mt-8">
                        <Input name="phone_number" value={phone_number} onChange={onChangeInput} placeholder="S??? ??i???n tho???i (b???t bu???c)" />
                      </div>
                      <div className="mt-8">
                        <Input name="email" value={email} onChange={onChangeInput} placeholder="Email (Vui l??ng ??i???n email ????? nh???n h??a ????n VAT)" />
                      </div>

                      <div className="fz-16 fw-700 mt-8">Ch???n c??ch th???c giao h??ng</div>
                      <div className="mt-4">
                        <Radio.Group onChange={e => setStateRadio(e.target.value)} value={stateRadio}>
                          <Radio value={1}>Nh???n t???i c???a h??ng</Radio>
                          <Radio value={2}>Giao h??ng t???n n??i</Radio>
                        </Radio.Group>
                      </div>

                      <div className="border-radius-16 p-16 mt-8" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                        <Row gutter={8}>
                          {(stateRadio === 2 && (
                            <>
                              <Col span={12}>
                                <Input name="provice" value={provice} onChange={onChangeInput} placeholder="T???nh/Th??nh Ph???" />
                              </Col>
                              <Col span={12}>
                                <Input name="district" value={district} onChange={onChangeInput} placeholder="Qu???n/Huy???n" />
                              </Col>
                              <Col span={24} className="mt-8">
                                <Input name="address" value={address} onChange={onChangeInput} placeholder="?????a ch??? ng?????i nh???n" />
                              </Col>
                            </>
                          )) || (
                            <Select defaultValue="" className="w-100" value={stateStore} onChange={e => setStateStore(e)}>
                              <Option value="">Ch???n c?? s?? b??n s??ch</Option>
                              <Option value="Nh?? s??ch Thi??n Minh,Ph??? Nh???n-Nam T??? Li??m H?? N???i">
                                Nh?? s??ch Thi??n Minh,Ph??? Nh???n-Nam T??? Li??m, H?? N???i
                              </Option>
                              <Option value="Nh?? s??ch Thi??n Minh,Qu???n Hai B?? Tr??ng H?? N???i">Nh?? s??ch Thi??n Minh,Qu???n Hai B?? Tr??ng H?? N???i</Option>
                              <Option value="Nh?? s??ch Thi??n Minh,Qu???n Thanh Xu??n, H?? N???i">Nh?? s??ch Thi??n Minh,Qu???n Thanh Xu??n, H?? N???i</Option>
                              <Option value="Nh?? s??ch Thi??n Minh,Qu???n H?? ????ng, H?? N???i">Nh?? s??ch Thi??n Minh,Qu???n H?? ????ng, H?? N???i</Option>
                            </Select>
                          )}
                        </Row>
                      </div>
                      <div className="mt-8">
                        <TextArea rows={2} name="note" value={note} onChange={onChangeInput} placeholder="Y??u c???u kh??c" />
                      </div>
                    </>
                  )}

                  {stateStep === 2 && (
                    <>
                      <div className="box-shadow p-16 border-radius-16">
                        <div className="fz-16 fw-500 text-upper text-center ">TH??NG TIN MUA S??CH</div>
                        <div>
                          Ng?????i nh???n: <strong>{full_name}</strong>
                        </div>
                        <div>
                          S??? ??i???n tho???i: <strong>{phone_number}</strong>
                        </div>
                        <div>
                          Email: <strong>{email}</strong>
                        </div>
                        <div>
                          Nh???n s???n ph???m t???i: <strong>{(stateRadio === 1 && stateStore) || `${address}-${district}-${provice}`}</strong>
                        </div>
                        <div>
                          T???ng ti???n: <strong>{sumPay}</strong>
                        </div>
                      </div>
                    </>
                  )}

                  {stateStep === 3 && (
                    <>
                      <div className="box-shadow p-16 border-radius-16">
                        <div className="fz-16 fw-500 text-upper text-center ">TH??NG TIN MUA S??CH</div>
                        <div>
                          Ng?????i nh???n: <strong>{full_name}</strong>
                        </div>
                        <div>
                          S??? ??i???n tho???i: <strong>{phone_number}</strong>
                        </div>
                        <div>
                          Email: <strong>{email}</strong>
                        </div>
                        <div>
                          Nh???n s???n ph???m t???i: <strong>{(stateRadio === 1 && stateStore) || `${address}-${district}-${provice}`}</strong>
                        </div>
                        <div>
                          T???ng ti???n: <strong>{sumPay}</strong>
                        </div>
                      </div>
                      <div className="p-16">
                        <div className="mt-8 mb-8 fz-16 fw-500">Thanh to??n theo ph????ng th???c</div>
                        <Row>
                          <Col span={24}>{renderItemPay('Thanh to??n t???i c???a h??ng', <SiHomeassistantcommunitystore />)}</Col>
                          <Col span={24}>{renderItemPay('Thanh to??n chuy???n kho???n', <MdPayment />)}</Col>
                        </Row>
                      </div>
                    </>
                  )}
                  {stateStep === 4 && (
                    <>
                      <div className="mb-8">C???m ??n Qu?? kh??ch h??ng. Trong 15 ph??t, SMS ho???c g???i ????? x??c nh???n ????n h??ng.</div>
                      <div className="box-shadow p-16 border-radius-16" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                        <div className="fz-16 fw-700 text-upper text-center mb-b ">?????T H??NG TH??NH C??NG</div>
                        <div>
                          M?? ????n h??ng: <strong>{packageNew?._id || '#000'}</strong>
                        </div>
                        <div>
                          Ng?????i nh???n: <strong>{full_name}</strong>
                        </div>
                        <div>
                          S??? ??i???n tho???i: <strong>{phone_number}</strong>
                        </div>
                        <div>
                          Email: <strong>{email}</strong>
                        </div>
                        <div>
                          Nh???n s???n ph???m t???i: <strong>{(stateRadio === 1 && stateStore) || `${address}-${district}-${provice}`}</strong>
                        </div>
                        <div>
                          H??nh th???c thanh to??n: <strong>{is_pay}</strong>
                        </div>
                        <div>
                          T???ng ti???n: <strong>{moneyMask(packageNew?.value)}</strong>
                        </div>
                        {is_pay === 'Thanh to??n chuy???n kho???n' && (
                          <div className="p-8 border-radius-16 mt-8" style={{ backgroundColor: 'white', color: '#155724' }}>
                            <div className="fw-700">Th??ng tin chuy???n kho???n:</div>
                            <ul style={{ marginBottom: 0 }}>
                              <li>C??ng ty TNHH Th????ng m???i v?? d???ch v??? k??? thu???t PanCake</li>
                              <li>Ng??n h??ng ViettinBank - S??? giao d???ch 2</li>
                              <li>
                                S??? t??i kho???n: <strong>104870361932</strong>
                              </li>
                              <li>
                                <strong>Hotline h??? tr???: 0898709170</strong>
                              </li>
                              <li>
                                <strong>C?? ph??p chuy???n kho???n:</strong> [T??n c?? nh??n/t??? ch???c] + [S??T mua h??ng] + [m?? thanh to??n 6 k?? t???] (n???u c??)
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      {packageNew?.products?.length > 0 && packageNew?.products?.map((item, idx) => <div key={idx}>{renderItemProduct(item)}</div>)}
                      <div className="d-flex mt-16">
                        <Button className="btn-primary" block onClick={() => navigate('/check_package')}>
                          <div>Ki???m tra ????n h??ng</div>
                          <div>
                            <AiOutlineCheckCircle />
                          </div>
                        </Button>
                        <Button className="btn-buy ml-8" block onClick={() => navigate('/home')}>
                          <div>Ti???p t???c mua h??ng</div>
                          <div>
                            <BsFillCartPlusFill />
                          </div>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </div>
          {stateStep !== 4 && (
            <div className="mt-8">
              <div className="box-shadow p-16 border-radius-16">
                <div className="d-flex justify-content-between mb-16 fw-700 fz-16">
                  <div>T???ng ti???n t???m t??nh</div>
                  <div className="text-red">{sumPay}</div>
                </div>
                <Button className="btn-buy fw-500 fz-16 mb-8" style={{ height: 60, textTransform: 'uppercase' }} block onClick={() => handleNext()}>
                  Ti???p t???c
                </Button>
                <Button className="btn-red fw-500 fz-16" style={{ height: 60, textTransform: 'uppercase' }} block>
                  <Link to="/home">Ch???n s???n ph???m kh??c</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Client>
  );
}

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators({ ...packageActions, ...cartActions }, dispatch) });
const mapStateToProps = state => ({ ...selectCart(state), ...selectAuth(state), ...selectPackage(state) });

export default connect(mapStateToProps, mapDispatchToProps)(Pay);
